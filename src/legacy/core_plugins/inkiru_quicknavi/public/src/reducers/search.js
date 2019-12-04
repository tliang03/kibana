import _ from 'lodash';

const _sort = (searches)=>{
  searches.sort((a, b) => {
    return (a.label.toUpperCase() > b.label.toUpperCase()) ? 1 : -1;
  });
  return searches;
};

const searches = (store = [], action) => {
  if (action.type === 'SEARCH_ALL_SEARCH') {
    const link = (window.location.protocol +
      '//' + window.location.host +
      window.location.pathname).replace('quicknavi', 'kibana') + '#/discover/';

    const mappedSearches = action.searches.map((obj) => {
      const search = obj._source.search;
      const id = obj._id.split(':')[1];
      const resp = {};

      _.extend(resp, search, {
        type: 'discover',
        label: search.title,
        value: id,
        saved_object_id: id,
        saved_object_title: search.title,
        saved_object_description: search.description,
        saved_object_link: link + id
      });

      return resp;
    });

    return _sort(mappedSearches);
  }

  return store || [];
};

export default searches;
