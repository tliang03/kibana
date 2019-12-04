
import { initAuthenticator } from './server/lib/authenticator';
import { initLoginView } from './server/views/login';
import { initLogoutView } from './server/views/logout';
import { initAuthenticateApi } from './server/api/authenticate';
import { authenticateFactory } from './server/lib/authenticate_factory';

export default function (kibana) {

  return new kibana.Plugin({
    require: ['elasticsearch'],

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        cookieName: Joi.string().default('inkiru_login_sid'),
        encryptionKey: Joi.string().default('inkiru_login_default_encrption_key'),
        secureCookies: Joi.boolean().default(false),
        sessionTimeout: Joi.number().allow(null).default(null),
        strategyMode: false
      }).default();
    },

    uiExports: {
      app: [
        {
          id: 'inkiru_logout',
          order: 100000,
          title: 'Log Out',
          main: 'plugins/inkiru_login/inkiru_logout',
          icon: 'plugins/inkiru_login/logout.svg',
          hidden: false
        }
      ],
      hacks: [
        'plugins/inkiru_login/on_session_timeout'
      ],
      injectDefaultVars: function (server) {
        const config = server.config();

        return {
          sessionTimeout: config.get('inkiru_login.sessionTimeout')
        };
      }
    },

    init: async function (server) {

      server.auth.scheme('inkiru-login', () => ({ authenticate: authenticateFactory(server) }));

      server.auth.strategy('inkiru-session', 'inkiru-login');

      server.auth.default('inkiru-session');

      await initAuthenticator(server);

      initAuthenticateApi(server);
      initLoginView(server);
      initLogoutView(server);

    }
  });
}
