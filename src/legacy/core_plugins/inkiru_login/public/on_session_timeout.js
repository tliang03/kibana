
import _ from 'lodash';
import { uiModules } from 'ui/modules';
import { isSystemApiRequest } from 'ui/system_api';
import { PathProvider } from './path';
import 'plugins/inkiru_login/auto_logout';

const SESSION_TIMEOUT_GRACE_PERIOD_MS = 5000;

const module = uiModules.get('inkiru_login', []);

module.config(($httpProvider) => {

  $httpProvider.interceptors.push(($timeout, $window, $q, $injector, sessionTimeout, Notifier, Private, autoLogout, i18n) => {

    const isUnauthenticated = Private(PathProvider).isUnauthenticated();

    const notifier = new Notifier();
    const notificationLifetime = 60 * 1000;

    const notificationOptions = {
      type: 'warning',
      content: i18n('inkiru_login.hacks.logoutNotification', {
        defaultMessage: 'You will soon be logged out due to inactivity. Click OK to resume.'
      }),
      icon: 'warning',
      title: i18n('inkiru_login.hacks.warningTitle', {
        defaultMessage: 'Warning'
      }),
      lifetime: Math.min(
        (sessionTimeout - SESSION_TIMEOUT_GRACE_PERIOD_MS),
        notificationLifetime
      ),
      actions: ['accept']
    };

    let pendingNotification;
    let activeNotification;

    function clearNotifications() {
      if (pendingNotification) $timeout.cancel(pendingNotification);

      if (activeNotification) activeNotification.clear();
    }

    function scheduleNotification() {
      pendingNotification = $timeout(showNotification, Math.max(sessionTimeout - notificationLifetime, 0));
    }

    function showNotification() {
      activeNotification = notifier.add(notificationOptions, (action) => {
        if (action === 'accept') {
          $injector.get('es').ping();
        } else {
          autoLogout();
        }
      });
    }

    function interceptorFactory(responseHandler) {

      return function interceptor(response) {

        if (!isUnauthenticated && !isSystemApiRequest(response.config) && sessionTimeout !== null) {
          clearNotifications();
          scheduleNotification();
        }

        return responseHandler(response);
      };
    }

    return {
      response: interceptorFactory(_.identity),
      responseError: interceptorFactory($q.reject)
    };

  });

});
