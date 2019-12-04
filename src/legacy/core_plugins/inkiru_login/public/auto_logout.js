import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';

const module = uiModules.get('inkiru_login');

module.service('autoLogout', ($window, Promise) => {
  return () => {
      
    $window.location.href = chrome.addBasePath(`/api/inkiru_login/v1/logout${$window.location.search}`);

    return Promise.halt();
  };
});
