
// import httpRequest from 'request';

import mappings from '../mappings.json';
import users from './data/users.json';

// const UPIC_HOST = 'https://inkiru-dashboard.prod.walmart.com';
// const FIND_USERS = '/isvc/customdatastore/QueryData';

export default (server) => {

  const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');

  //API Get dashbord ranking list
  server.route({
    method: ['GET'],
    path: '/api/dashrank/list',
    handler: async (req) => {

      let resp = {};
      let error = null;

      const body = {
        'index': req.query.index,
        'body': {
          'query': {
            'match_all': {}
          },
          'size': 10000
        }
      };

      try {
        req.payload = {};
        resp = await callWithRequest(req, 'search', body);
      } catch (errResp) {
        try {

          await callWithRequest(req, 'indices.create', mappings);
          resp = await callWithRequest(req, 'search', body);
        } catch(err) {
          error = err.response;
        }
      }

      return {
        resp: resp,
        error: error
      };
    }
  });

  //API Get all dashboards
  server.route({
    method: ['GET'],
    path: '/api/dashrank/dashboards',
    handler: async (req) => {
      let resp = {};
      let error = null;

      const body = {
        'index': req.query.index,
        'body': {
          'query': {
            'query_string': {
              'query': 'type: ' + req.query.type
            }
          },
          'size': 10000
        }
      };

      try {
        req.payload = {};
        resp = await callWithRequest(req, 'search', body);
      } catch (errResp) {
        error = errResp.response;
      }

      return {
        resp: resp,
        error: error
      };
    }
  });

  //API Get users list
  server.route({
    method: ['GET'],
    path: '/api/dashrank/users',
    handler: async () => {
      // let resp = {};
      const error = null;

      return {
        resp: users,
        error: error
      };

    }
  });

  //API Delete dashboard by Id
  server.route({
    method: ['DELETE'],
    path: '/api/dashrank/dashboard',
    handler: async (req) => {
      let resp = {};
      let error = null;

      const body = [{
        'delete': {
          '_index': req.query.index,
          '_type': '_doc',
          '_id': req.query.id
        }
      }];

      try {
        req.payload = {};
        resp = await callWithRequest(req, 'bulk', { body: body });

      } catch (errResp) {
        error = errResp.response;
      }

      return {
        resp: resp,
        error: error
      };

    }
  });

  //API Add / Edit dashboard
  server.route({
    method: ['POST'],
    path: '/api/dashrank/dashboard',
    handler: async (req) => {
      let resp = {};
      let error = null;

      const payload = req.payload;
      const id = req.query.id;

      const body = [];

      const header = {
        'index': {
    			'_index': payload.index,
    			'_type': '_doc'
    		}
      };

      if(id) {
        header.index._id = id;
      }

      body.push(header);

      body.push({
        groups: payload.groups,
        saved_object_id: payload.saved_object_id,
        saved_object_title: payload.saved_object_title,
        saved_object_description: payload.saved_object_description,
        members: payload.members,
        notes: payload.notes,
        tags: payload.tags,
        type: payload.type
      });

      try {
        resp = await callWithRequest(req, 'bulk', { body: body });

      } catch (errResp) {


        error = errResp.response;
      }

      return {
        resp: resp,
        error: error
      };
    }
  });

  server.injectUiAppVars('quicknavi', () => {
    const xpack = server.plugins.xpack_main;
    return {
      hasXpackInstalled: !!xpack
    };
  });
};
