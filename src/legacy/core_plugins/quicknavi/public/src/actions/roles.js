const $ = require('jquery');

// const TOOLS_DOMAIN = 'tools.internal';

const conf = {
  'index': '.security',
  'doctype_role': 'role'
};

export function searchAllRoles() {
  return (dispatch) => {
    const url = `../api/dashrank/roles?index=${conf.index}&type=${conf.doctype_role}`;
    return $.ajax({
      url: url,
      type: 'GET'
    })
      .then((response) => {
        const res = JSON.parse(response);
        dispatch({
          type: 'SEARCH_ALL_ROLES',
          roles: res.hits.hits
        });
      }, (error) => {
        dispatch({
          type: 'ERROR_SEARCH_ROLES',
          errormsg: error.responseText
        });
      });
  };
}

export function searchAllUsers() {

  return (dispatch) => {
    const url = `../api/dashrank/users`;

    return $.ajax({
      url: url,
      type: 'GET'
    })
      .then((response) => {
        const resp = response.resp;
        const error = response.error;

        if(error) {
          dispatch({
            type: 'ERROR_USERS',
            level: 'ERROR',
            errormsg: error
          });

        } else if(resp) {

          dispatch({
            type: 'SEARCH_ALL_USERS',
            users: resp
          });
        }

      }, (error)=> {
        dispatch({
          type: 'ERROR_USERS',
          level: 'ERROR',
          errormsg: error
        });
      });

  };

}
