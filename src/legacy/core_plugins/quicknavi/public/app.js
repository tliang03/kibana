import React from 'react';

import chrome from 'ui/chrome';

import 'ui/autoload/all';
import 'plugins/kbn_vislib_vis_types/kbn_vislib_vis_types';

import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';

import DashboardRank from './src/components/dashrank';
import configureStore from './src/stores/configure_store';
const store = configureStore();

chrome
  .setRootTemplate(`<div id="quicknavi_root" class="quicknavi"></div>`)
  .setRootController(($scope, docTitle) => {
    docTitle.change('quicknavi');

    // Mount the React app
    const el = document.getElementById('quicknavi_root');

    let id = null;

    if(location.href.indexOf('id=') > -1) {
      id = location.href.substring(location.href.indexOf('id=') + 3);
    }

    ReactDOM.render(
      <Provider store={store}>
        <DashboardRank
          id={id}
        />
      </Provider>, el
    );
  });
