/*
 * Jasmine React Patch for Copy Query
 * Used by iBot / Logstash ...
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import { timefilter } from 'ui/timefilter';
import {
  EuiButtonEmpty,
  EuiCopy
} from '@elastic/eui';

export class CopyQuery extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: null
    };

    this.setQuery = this.setQuery.bind(this);
  }

  componentWillUnmount() {
    this.setState({
      query: null
    });
  }

  componentDidMount() {
    this.setQuery(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setQuery(nextProps);
  }

  setQuery(props) {
    if(props.adapters) {
      const requests = props.adapters.requests.getRequests();
      const request = requests.length ? requests[0] : null;
      let query = {};

      if(request && request.stats && Object.keys(request.stats).length) {
        const stats = request.stats;
        const index = stats['Index pattern'] && stats['Index pattern'].value;
        const body = this.getQueryBody(request.json, props.columns);

        query = {
          index: index,
          template: body
        };

        this.setState({
          query: query
        });
      }
    }
  }

  getQueryBody(query, columns) {
    const body = cloneDeep(query);
    const timeRange = {
      from: timefilter.getTime().from,
      to: timefilter.getTime().to
    };

    if('version' in body) {
      delete body.version;
    }

    if('highlight' in body) {
      delete body.highlight;
    }

    if('docvalue_fields' in body) {
      delete body.docvalue_fields;
    }

    if('script_fields' in body) {
      delete body.script_fields;
    }

    if('stored_fields' in body) {
      delete body.stored_fields;
    }

    const queryMust = body.query.bool.must.map((query) => {
      if(query.range) {
        const queryRange = Object.keys(query.range).map((key) => {
          const obj = {};

          obj[key] = {
            'gte': timeRange.from,
            'lte': timeRange.to
          };

          return obj;
        });
        query.range = queryRange[0];
      }

      return query;
    });

    body.query.bool.must = queryMust;

    if(columns && columns.length) {
      if('_source' in body) {

        if(columns.indexOf('_source') > -1) {
          columns.splice(columns.indexOf('_source'), 1);
        }

        body._source.includes = columns;
      }
    }


    return body;
  }

  render() {
    const textToCopy = this.state.query ? JSON.stringify(this.state.query) : '';

    return (
      <EuiCopy textToCopy={textToCopy} anchorClassName="sharePanel__copyAnchor">
        {
          (copy: () => void) => (
            <EuiButtonEmpty
              size="s"
              onClick={copy}
            >
              Copy Query
            </EuiButtonEmpty>
          )
        }
      </EuiCopy>
    );
  }
}

CopyQuery.propTypes = {
  adapters: PropTypes.object,
  columns: PropTypes.arrayOf(PropTypes.string)
};
