
import hapiAuthCookie from 'hapi-auth-cookie';

const HAPI_STRATEGY_NAME = 'security-cookie';

export class Session {

  _server = null;

  _ttl = null;

  constructor(server) {
    const config = server.config();

    this._server = server;
    this._ttl = config.get('inkiru_login.sessionTimeout');

    console.log('inkiru ttl' + this._ttl);
  }

  async get(request) {

    try {
      const session = await this._server.auth.test(HAPI_STRATEGY_NAME, request);

      if (!Array.isArray(session)) {
        return session.value;
      }

      if (session.length === 1) {
        return session[0].value;
      }

      return null;
    } catch (err) {

      return null;
    }
  }

  async set(request, value) {

    request.cookieAuth.set({
      value,
      expires: this._ttl && Date.now() + this._ttl
    });
  }


  async clear(request) {
    request.cookieAuth.clear();
  }

  static async create(server) {

    const config = server.config();

    const password = config.get('inkiru_login.encryptionKey');
    const cookieName = config.get('inkiru_login.cookieName');
    const secure = config.get('inkiru_login.secureCookies');
    const strategyMode = config.get('inkiru_login.strategyMode');

    await server.register({
      plugin: hapiAuthCookie
    });

    server.auth.strategy(HAPI_STRATEGY_NAME, 'cookie', {
      cookie: cookieName,
      password,
      clearInvalid: true,
      validateFunc: Session._validateCookie,
      isHttpOnly: true,
      isSecure: secure,
      isSameSite: false,
      path: `${config.get('server.basePath')}/`,
    });

    if (strategyMode) {
      server.auth.default({
        strategy: HAPI_STRATEGY_NAME,
        mode: 'required'
      });
    }

    return new Session(server);
  }

  static _validateCookie(request, session) {
    if (session.expires && session.expires < Date.now()) {
      return { valid: false };
    }

    return { valid: true };
  }
}
