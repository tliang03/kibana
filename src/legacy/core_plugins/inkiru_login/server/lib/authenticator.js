
import { Session } from './session';

import { AuthenticationResult } from './authentication_result';
import { DeauthenticationResult } from './deauthentication_result';

import { InkiruAuthenticationProvider } from './inkiru_auth';

class Authenticator {
  _server = null;

  _authScope = null;

  _session = null;

  constructor(server, session) {
    this._server = server;
    this._session = session;

    this._provider =  new InkiruAuthenticationProvider();

  }

  async authenticate(request) {

    const isSystemApiRequest = this._server.plugins.kibana.systemApi.isSystemApiRequest(request);
    const existingSession = await this._session.get(request);

    const authenticationResult = await this._provider.authenticate(
      request,
      existingSession ?  existingSession.state : null
    );

    if (authenticationResult.shouldUpdateState()) {

      const sessionCanBeUpdated = (authenticationResult.succeeded() || authenticationResult.redirected())
        && (authenticationResult.shouldUpdateState() || !isSystemApiRequest);

      if (authenticationResult.shouldClearState() || authenticationResult.failed()) {
        await this._session.clear(request);

      } else if (sessionCanBeUpdated) {
        await this._session.set(request,
          authenticationResult.shouldUpdateState() ? { state: authenticationResult.state } : existingSession);

      }
    }

    if (authenticationResult.failed()) {
      return authenticationResult;
    }

    if (authenticationResult.succeeded()) {

      return AuthenticationResult.succeeded({ ...authenticationResult.user });
    } else if (authenticationResult.redirected()) {
      return authenticationResult;
    }

    return authenticationResult;
  }

  async deauthenticate(request) {

    const sessionValue = await this._getSessionValue(request);

    if (sessionValue) {
      await this._session.clear(request);

      return this._provider.deauthenticate(request, sessionValue.state);
    }

    return DeauthenticationResult.notHandled();
  }

  async _getSessionValue(request) {

    let sessionValue = await this._session.get(request);

    if (sessionValue) {
      await this._session.clear(request);
      sessionValue = null;
    }

    return sessionValue;
  }
}

export async function initAuthenticator(server) {
  const session = await Session.create(server);
  const authenticator = new Authenticator(server, session);

  server.expose('authenticate', (request) => authenticator.authenticate(request));
  server.expose('deauthenticate', (request) => authenticator.deauthenticate(request));

}
