
const $ = require('jquery');

const conf = {
  'index': '.kibana'
};

export function searchAllDashboards() {
  return (dispatch) => {
    const url = `../api/dashrank/dashboards?index=${conf.index}&type=dashboard`;

    return $.ajax({
      url: url,
      type: 'GET'
    })
      .then((response) => {
        const resp = response.resp;
        const error = response.error;

        if(error) {
          dispatch({
            type: 'ERROR_SEARCH',
            level: 'ERROR',
            errormsg: error
          });

        } else if(resp) {
          dispatch({
            type: 'SEARCH_ALL_DASHBOARDS',
            dashboards: resp.hits.hits
          });
        }
      }, (error) => {
        dispatch({
          type: 'ERROR_SEARCH',
          level: 'ERROR',
          errormsg: error
        });
      });
  };
}

export function searchAllSearch() {
  return (dispatch) => {
    const url = `../api/dashrank/dashboards?index=${conf.index}&type=search`;
    return $.ajax({
      url: url,
      type: 'GET'
    })
      .then((response) => {
        const resp = response.resp;
        const error = response.error;

        if(error) {
          dispatch({
            type: 'ERROR_SEARCH',
            level: 'ERROR',
            errormsg: error
          });

        } else if(resp) {
          dispatch({
            type: 'SEARCH_ALL_SEARCH',
            searches: resp.hits.hits
          });
        }
      }, (error) => {
        dispatch({
          type: 'ERROR_SEARCH',
          level: 'ERROR',
          errormsg: error
        });
      });
  };
}
