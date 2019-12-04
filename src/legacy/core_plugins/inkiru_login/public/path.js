import chrome from 'ui/chrome';

export function PathProvider($window) {
  const path = chrome.removeBasePath($window.location.pathname);

  return {
    isUnauthenticated() {
      return path === '/inkiru_login' || path === '/inkiru_login';
    }
  };
}
