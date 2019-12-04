
import { wrapError } from '../lib/errors';

export function initAuthenticateApi(server) {

  server.route({
    method: 'GET',
    path: '/api/inkiru_login/v1/logout',
    config: {
      auth: false
    },
    async handler(request, h) {
      try {
        const deauthenticationResult = await server.plugins.inkiru_login.deauthenticate(request);

        if (deauthenticationResult.failed()) {
          throw wrapError(deauthenticationResult.error);
        }

        return h.redirect(
          deauthenticationResult.redirectURL ||  `${request.server.info.uri}${request.getBasePath()}/`
        );
      } catch (err) {
        throw wrapError(err);
      }
    }
  });

}
