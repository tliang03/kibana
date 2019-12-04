
const AuthenticationResultStatus = Object.freeze({

  NotHandled: 'not-handled',

  Succeeded: 'succeeded',

  Failed: 'failed',

  Redirected: 'redirected'
});

export class AuthenticationResult {

  _status;
  _user;
  _state;
  _error;
  _redirectURL;

  get user() {
    return this._user;
  }

  get state() {
    return this._state;
  }

  get error() {
    return this._error;
  }

  get redirectURL() {
    return this._redirectURL;
  }

  constructor(status, { user, state, error, redirectURL } = {}) {
    this._status = status;
    this._user = user;
    this._state = state;
    this._error = error;
    this._redirectURL = redirectURL;
  }

  notHandled() {
    return this._status === AuthenticationResultStatus.NotHandled;
  }

  succeeded() {
    return this._status === AuthenticationResultStatus.Succeeded;
  }

  failed() {
    return this._status === AuthenticationResultStatus.Failed;
  }

  redirected() {
    return this._status === AuthenticationResultStatus.Redirected;
  }

  static notHandled() {
    return new AuthenticationResult(AuthenticationResultStatus.NotHandled);
  }

  static succeeded(user, state) {
    if (!user) {
      throw new Error('User should be specified.');
    }

    return new AuthenticationResult(
      AuthenticationResultStatus.Succeeded,
      { user, state }
    );
  }

  static failed(error) {
    if (!error) {
      throw new Error('Error should be specified.');
    }

    return new AuthenticationResult(
      AuthenticationResultStatus.Failed,
      { error }
    );
  }

  static redirectTo(redirectURL, state) {
    if (!redirectURL) {
      throw new Error('Redirect URL must be specified.');
    }

    return new AuthenticationResult(
      AuthenticationResultStatus.Redirected,
      { redirectURL, state }
    );
  }

  shouldUpdateState() {
    return this._state != null;
  }

  shouldClearState() {
    return this._state === null;
  }
}
