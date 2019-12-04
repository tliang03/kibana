/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import elasticsearch from 'elasticsearch';
import { get, set, isEmpty, cloneDeep, pick } from 'lodash';
import toPath from 'lodash/internal/toPath';
import Boom from 'boom';

import filterHeaders from './filter_headers';
import { parseConfig } from './parse_config';

import LOGGING_MAPPING from '../logging_mapping.json';
import { getLoggingIndex, LOGGING_BODY } from '../logging_const';

LOGGING_MAPPING.index = getLoggingIndex();

const IGNORE_TYPES = ['mget', 'update', 'get'];

export class Cluster {
  constructor(config) {
    this._config = {
      ...config
    };
    this.errors = elasticsearch.errors;

    this._clients = new Set();
    this._client = this.createClient();
    this._noAuthClient = this.createClient(
      { auth: false },
      { ignoreCertAndKey: !this.getSsl().alwaysPresentCertificate }
    );

    return this;
  }

  callWithRequest = async (req = {}, endpoint, clientParams = {}, options = {}) => {
    const shdLog = shouldLog(req, endpoint, clientParams);
    const startTs = new Date();

    let logRes;
    let logId;

    if (req.headers) {
      const filteredHeaders = filterHeaders(req.headers, this.getRequestHeadersWhitelist());
      set(clientParams, 'headers', filteredHeaders);
    }

    if(shdLog) {
      logRes = await this.setInkiruLogs(req, startTs, endpoint, clientParams);
      logId = logRes && logRes.items[0].index._id;
    }

    return callAPI(this._noAuthClient, endpoint, clientParams, options).then((response) => {
      if(shdLog) {
        this.updateInkiruLogs(req, startTs, endpoint, clientParams, logId);
      }
      return response;
    });
  }

  callWithInternalUser = (endpoint, clientParams = {}, options = {}) => {
    return callAPI(this._client, endpoint, clientParams, options);
  }

  getRequestHeadersWhitelist = () => getClonedProperty(this._config, 'requestHeadersWhitelist');

  getCustomHeaders = () => getClonedProperty(this._config, 'customHeaders');

  getRequestTimeout = () => getClonedProperty(this._config, 'requestTimeout');

  getHosts = () => getClonedProperty(this._config, 'hosts');

  getSsl = () => getClonedProperty(this._config, 'ssl');

  getClient = () => this._client;

  close() {
    for (const client of this._clients) {
      client.close();
    }

    this._clients.clear();
  }

  createClient = (configOverrides, parseOptions) => {
    const config = {
      ...this._getClientConfig(),
      ...configOverrides
    };

    const client = new elasticsearch.Client(parseConfig(config, parseOptions));
    this._clients.add(client);
    return client;
  }

  _getClientConfig = () => {
    return getClonedProperties(this._config, [
      'hosts',
      'ssl',
      'username',
      'password',
      'customHeaders',
      'plugins',
      'apiVersion',
      'keepAlive',
      'pingTimeout',
      'requestTimeout',
      'sniffOnStart',
      'sniffInterval',
      'sniffOnConnectionFault',
      'log'
    ]);
  }

  setInkiruLogs = async (req = {}, startTs, clientParams = {}, endpoint) => {
    try {
      const { query } = req;

      try {
        await callAPI(this._noAuthClient, 'search', LOGGING_BODY);
      } catch (errResp) {
        await callAPI(this._noAuthClient, 'indices.create', LOGGING_MAPPING);
      }

      const reqBody = [];

      const header = {
        'index': {
          '_index': getLoggingIndex(),
          '_type': '_doc'
        }
      };

      reqBody.push(header);

      if(typeof (endpoint) === 'object') {
        endpoint = JSON.stringify(endpoint);
      } else if(typeof (endpoint) !== 'string') {
        endpoint = endpoint.toString();
      }

      const body = {
        create_ts: startTs,
        start_ts: startTs,
        end_point: endpoint,
        query_string: JSON.stringify(query),
        payloads: JSON.stringify(clientParams)
      };

      reqBody.push(body);

      return await callAPI(this._noAuthClient, 'bulk', { body: reqBody });
    } catch (err) {
      console.log('set inkiru log error : ' + err);
    }

  }

  updateInkiruLogs = async (req = {}, startTs, endpoint, clientParams = {}, id) => {
    try {
      const { query } = req;
      const endTs = new Date();

      const reqBody = [];

      const header = {
        'index': {
          '_index': getLoggingIndex(),
          '_type': '_doc',
          '_id': id
        }
      };

      reqBody.push(header);

      if(typeof (endpoint) === 'object') {
        endpoint = JSON.stringify(endpoint);
      } else if(typeof (endpoint) !== 'string') {
        endpoint = endpoint.toString();
      }

      const body = {
        create_ts: startTs,
        start_ts: startTs,
        end_point: endpoint,
        end_ts: endTs,
        duration: endTs - startTs,
        query_string: JSON.stringify(query),
        payloads: JSON.stringify(clientParams)
      };

      reqBody.push(body);

      return await callAPI(this._noAuthClient, 'bulk', { body: reqBody });
    } catch (err) {
      console.log('update inkiru log error : ' + err);
    }

  }
}

function shouldLog(req, endpoint, clientParams) {
  const { query, payload } = req;

  return query &&
        payload &&
        endpoint &&
        IGNORE_TYPES.indexOf(endpoint) === -1 &&
        JSON.stringify(clientParams).indexOf(getLoggingIndex()) === -1;
}

function callAPI(client, endpoint, clientParams = {}, options = {}) {
  const wrap401Errors = options.wrap401Errors !== false;
  const clientPath = toPath(endpoint);
  const api = get(client, clientPath);

  let apiContext = get(client, clientPath.slice(0, -1));
  if (isEmpty(apiContext)) {
    apiContext = client;
  }

  if (!api) {
    throw new Error(`called with an invalid endpoint: ${endpoint}`);
  }

  return api.call(apiContext, clientParams).catch((err) => {
    if (!wrap401Errors || err.statusCode !== 401) {
      return Promise.reject(err);
    }

    const boomError = Boom.boomify(err, { statusCode: err.statusCode });
    const wwwAuthHeader = get(err, 'body.error.header[WWW-Authenticate]');
    boomError.output.headers['WWW-Authenticate'] = wwwAuthHeader || 'Basic realm="Authorization Required"';

    throw boomError;
  });
}

function getClonedProperties(config, paths) {
  return cloneDeep(paths ? pick(config, paths) : config);
}

function getClonedProperty(config, path) {
  return cloneDeep(path ? get(config, path) : config);
}
