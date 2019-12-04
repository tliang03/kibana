import { AuthenticationResult } from './authentication_result';
import { DeauthenticationResult } from './deauthentication_result';

import Request from 'request';

export class InkiruCredentials {

  static validateToken(request, code) {

    return new Promise((resolve, reject) => {

      Request.post({
        uri: 'https://inkiru-dashboard.prod.walmart.com/portal/oauth/token',
        json: true,
        headers: {
          'Cookie': 'JSESSIONID=' + code
        },
        port: 443,
        rejectUnauthorized: false,
        timeout: 5000
      }, (err, resp, body) => {

        if(err) {
          return resolve({
            errors: err
          });
        }

        if(body.errors) {
          return resolve({
            errors: body
          });
        }

        return resolve({
          user: body
        });
      });
    });
  }

  static getCodeFromRequest(request) {
    return request.query.code;
  }

  static getCodeFromHeader(request) {
    return request.headers.authorization;
  }
}

export class InkiruAuthenticationProvider {

  _options = null;

  constructor(options) {
    this._options = options;
  }

  async authenticate(request, state) {

    // first try from login payload
    let authenticationResult = await this._autheticateViaInkiruToken(request);

    // try from request header
    if (authenticationResult.notHandled()) {
      authenticationResult = await this._authenticateViaHeader(request);
    }

    // try from request state
    if (authenticationResult.notHandled() && state) {
      authenticationResult = await this._authenticateViaState(request, state);
    }

    if(authenticationResult.notHandled() || authenticationResult.failed()) {

      const nextURL = `${request.getBasePath()}${request.url.path}`;

      authenticationResult = AuthenticationResult.redirectTo(
        `${request.getBasePath()}/inkiru_login?next=${nextURL}`
      );
    }

    return authenticationResult;
  }

  async deauthenticate(request) {
    const nextURL = `${request.server.info.uri}${request.getBasePath()}${'/inkiru_login?next='}${request.getBasePath()}`;

    return DeauthenticationResult.redirectTo(
      `${request.getBasePath()}/inkiru_login?next=${nextURL}`
    );
  }

  async _autheticateViaInkiruToken(request) {

    const token = InkiruCredentials.getCodeFromRequest(request);

    if (!token) {
      return AuthenticationResult.notHandled();
    }

    try {

      const resp = await InkiruCredentials.validateToken(request, token);

      if(resp.errors) {
        return AuthenticationResult.failed(resp.errors);
      } else {
        return AuthenticationResult.succeeded(resp.user, { authorization: token });
      }

    } catch(err) {

      return AuthenticationResult.failed(err);
    }

  }

  async _authenticateViaHeader(request) {
    const authorization = InkiruCredentials.getCodeFromHeader(request);

    if (!authorization) {
      return AuthenticationResult.notHandled();
    }

    try {
      const resp = await InkiruCredentials.validateToken(request, authorization);

      if(resp.errors) {
        return AuthenticationResult.failed(resp.errors);
      } else {
        return AuthenticationResult.succeeded(resp.user);
      }

    } catch(err) {

      return AuthenticationResult.failed(err);
    }
  }

  async _authenticateViaState(request, { authorization }) {

    if (!authorization) {
      return AuthenticationResult.notHandled();
    }

    try {
      const resp = await InkiruCredentials.validateToken(request, authorization);

      if(resp.errors) {
        return AuthenticationResult.failed(resp.errors);
      } else {
        return AuthenticationResult.succeeded(resp.user);
      }

    } catch(err) {

      return AuthenticationResult.failed(err);
    }
  }

}
