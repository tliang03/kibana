import _ from 'lodash';

const _sort = (vises)=>{
  vises.sort((a, b) => {
    return (a.label.toUpperCase() > b.label.toUpperCase()) ? 1 : -1;
  });
  return vises;
};

const visualizations = (store = [], action) => {
  if (action.type === 'SEARCH_ALL_VISUALIZATION') {
    const link = (window.location.protocol +
      '//' + window.location.host +
      window.location.pathname).replace('quicknavi', 'kibana') + '#/visualize/edit/';

    const mappedVises = action.visualizations.map((obj) => {
      const vis = obj._source.visualization;
      const id = obj._id.split(':')[1];
      const resp = {};

      _.extend(resp, vis, {
        type: 'visualize',
        label: vis.title,
        value: id,
        saved_object_id: id,
        saved_object_title: vis.title,
        saved_object_description: vis.description,
        saved_object_link: link + id
      });

      return resp;
    });

    return _sort(mappedVises);
  }

  return store || [];
};

export default visualizations;
