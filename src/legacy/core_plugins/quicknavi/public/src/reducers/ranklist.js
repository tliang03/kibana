
import _ from 'lodash';

const ranklist = (store = [], action) => {
  let storeCopy = _.cloneDeep(store);

  const resp = action.resp;
  const link = (window.location.protocol + '//' + window.location.host + window.location.pathname).replace('quicknavi', 'kibana') + '#/';

  let id;
  const item = {};
  let newStore = [];
  let savedObject = {};
  let type = null;

  if(resp && resp.type) {

    type = resp.type;

    savedObject = {
      id: resp.saved_object_id,
      title: resp.saved_object_title,
      description: resp.saved_object_description
    };

    if(resp.type !== 'visualize') {
      savedObject.link = link + type + '/' + resp.saved_object_id;
    } else {
      savedObject.link = link + type + '/edit/' + resp.saved_object_id;
    }
  }

  switch(action.type) {
    case 'ADD_DASHBOARD':
      id = action.id;

      _.extend(item, resp, {
        id: action.id,
        type: type,
        savedObject: savedObject,
        tags: resp.tags ? resp.tags.split(',') : [],
        groups: resp.groups ? resp.groups.split(',') : [],
        members: resp.members ? resp.members.split(',') : [],
        tags_str: resp.tags,
        groups_str: resp.groups,
        members_str: resp.members
      });

      storeCopy.push(item);

      return storeCopy;

    case 'EDIT_DASHBOARD':
      id = action.id;

      storeCopy = storeCopy.map((obj) => {
        if(obj.id === id) {
          _.extend(item, resp, {
            id: action.id,
            type: type,
            savedObject: savedObject,
            tags: resp.tags ? resp.tags.split(',') : [],
            groups: resp.groups ? resp.groups.split(',') : [],
            members: resp.members ? resp.members.split(',') : [],
            tags_str: resp.tags,
            groups_str: resp.groups,
            members_str: resp.members
          });

          return item;
        } else {
          return obj;
        }
      });

      return storeCopy;

    case 'DELETE_DASHBOARD' :
      id = action.id;

      newStore = storeCopy.filter((obj)=>{
        return obj.id !== id;
      });

      return newStore;

    case 'SEARCH_ALL_LIST':
      action.list.forEach((row) => {
        const obj = {};
        const id = row._id;
        let savedObject = {};

        type = row._source.type || null;

        savedObject = {
          id: row._source.saved_object_id,
          title: row._source.saved_object_title,
          description: row._source.saved_object_description
        };

        if(type !== 'visualize') {
          savedObject.link = link + type + '/' + row._source.saved_object_id;
        } else {
          savedObject.link = link + type + '/edit/' + row._source.saved_object_id;
        }

        _.extend(obj, row._source, {
          id: id,
          type: type,
          savedObject: savedObject,
          tags: row._source.tags ? row._source.tags.split(',') : [],
          groups: row._source.groups ? row._source.groups.split(',') : [],
          members: row._source.members ? row._source.members.split(',') : [],
          tags_str: row._source.tags,
          groups_str: row._source.groups,
          members_str: row._source.members
        });

        newStore.push(obj);
      });

      return newStore;

    default:

      return store || [];
  }
};

export default ranklist;
