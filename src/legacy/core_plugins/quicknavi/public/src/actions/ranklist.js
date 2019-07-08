import $ from 'jquery';

const conf = {
  'index': 'tools.dashboardrank'
};

export function addItem(item) {

  return (dispatch) => {
    const url = '../api/dashrank/dashboard';

    return $.ajax({
      url: url,
      method: 'POST',
      data: {
        index: conf.index,
        type: item.type,
        groups: item.groups,
        saved_object_id: item.saved_object_id,
        saved_object_title: item.saved_object_title,
        saved_object_description: item.saved_object_description,
        members: item.members,
        tags: item.tags,
        notes: item.notes
      }
    })
      .then((response) => {
        const resp = response.resp;
        const error = response.error;

        if(error) {
          dispatch({
            type: 'ERROR_ADD',
            level: 'ERROR',
            errormsg: error
          });

          return;

        } else if(resp) {
          dispatch({
            type: 'ADD_DASHBOARD',
            resp: item,
            id: resp.items[0].index._id
          });
        }
      }, (error)=>{
        dispatch({
          type: 'ERROR_ADD',
          level: 'ERROR',
          errormsg: error
        });
      });
  };
}

export function editItem(item, id) {

  return (dispatch) => {
    const url = `../api/dashrank/dashboard?id=${id}`;

    return $.ajax({
      url: url,
      method: 'POST',
      data: {
        index: conf.index,
        type: item.type,
        groups: item.groups,
        saved_object_id: item.saved_object_id,
        saved_object_title: item.saved_object_title,
        saved_object_description: item.saved_object_description,
        members: item.members,
        tags: item.tags,
        notes: item.notes
      }
    })
      .then((response) => {
        const resp = response.resp;
        const error = response.error;

        if(error) {

          dispatch({
            type: 'ERROR_EDIT',
            level: 'ERROR',
            errormsg: error
          });

          return;

        } else if(resp) {
          dispatch({
            type: 'EDIT_DASHBOARD',
            resp: item,
            id: id
          });
        }
      }, (error)=>{
        dispatch({
          type: 'ERROR_ADD',
          level: 'ERROR',
          errormsg: error
        });
      });
  };
}

export function deleteItem(itemObj) {
  const id = itemObj.id;

  return (dispatch) => {
    const url = `../api/dashrank/dashboard?index=${conf.index}&id=${id}`;
    return $.ajax({
      url: url,
      method: 'DELETE',
      headers: {
        'kbn-xsrf': 'reporting'
      }
    })
      .then((response) => {
        const resp = response.resp;
        const error = response.error;

        if(error) {
          dispatch({
            type: 'ERROR_DELETE',
            level: 'ERROR',
            errormsg: error
          });

        } else if(resp) {

          dispatch({
            type: 'DELETE_DASHBOARD',
            id: id
          });
        }
      }, (error)=>{
        dispatch({
          type: 'ERROR_DELETE',
          level: 'ERROR',
          errormsg: error
        });
      });
  };
}

export function searchAllList() {
  return (dispatch) => {
    const url = `../api/dashrank/list?index=${conf.index}`;
    return $.ajax({
      url: url,
      type: 'GET'
    })
      .then((response) => {
        const resp = response.resp;
        const error = response.error;

        if(error) {
          dispatch({
            type: 'ERROR_LIST',
            level: 'ERROR',
            errormsg: error
          });

        } else if(resp) {

          dispatch({
            type: 'SEARCH_ALL_LIST',
            list: resp.hits.hits
          });
        }

      }, (error)=>{
        dispatch({
          type: 'ERROR_LIST',
          level: 'ERROR',
          errormsg: error
        });
      });
  };
}
