import _ from 'lodash';

const _sort = (dashboards)=>{
  dashboards.sort((a, b) =>{
    return (a.label.toUpperCase() > b.label.toUpperCase()) ? 1 : -1;
  });
  return dashboards;
};

const dashboards = (store = [], action) => {
  if (action.type === 'SEARCH_ALL_DASHBOARDS') {
    const link = (window.location.protocol +
      '//' + window.location.host +
      window.location.pathname).replace('quicknavi', 'kibana') + '#/dashboard/';

    const mappedDashboards = action.dashboards.map((obj) => {
      const dashboard = obj._source.dashboard;
      const id = obj._id.split(':')[1];
      const resp = {};

      _.extend(resp, dashboard, {
        type: 'dashboard',
        label: dashboard.title,
        value: id,
        saved_object_id: id,
        saved_object_title: dashboard.title,
        saved_object_description: dashboard.description,
        saved_object_link: link + id
      });

      return resp;
    });

    return _sort(mappedDashboards);
  }

  return store || [];
};

export default dashboards;
