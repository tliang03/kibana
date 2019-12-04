
import Boom from 'boom';
import { wrapError } from './errors';

export function authenticateFactory(server) {

  return async function authenticate(request, h) {

    let authenticationResult;

    try {
      authenticationResult = await server.plugins.inkiru_login.authenticate(request);

    } catch(err) {

      return wrapError(err);
    }

    if (authenticationResult.succeeded()) {

      return h.authenticated({ credentials: authenticationResult.user });

    } else if (authenticationResult.redirected()) {

      return h.redirect(authenticationResult.redirectURL).takeover();

    } else if (authenticationResult.failed()) {

      return wrapError(authenticationResult.error.errors);

    } else {
      return Boom.unauthorized();
    }
  };
}
