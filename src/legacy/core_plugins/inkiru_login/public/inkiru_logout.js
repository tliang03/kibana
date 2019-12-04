import 'ui/doc_title';

import 'ui/autoload/all';

import chrome from 'ui/chrome';

chrome
  .setVisible(false)
  .setRootTemplate(`<div id="inkiru_logout" class="inkiru_logout"></div>`)
  .setRootController(($scope, $window, docTitle) => {

    docTitle.change('inkiru_logout');

    $window.location.href = chrome.addBasePath(`/api/inkiru_login/v1/logout${$window.location.search}`);

  });
