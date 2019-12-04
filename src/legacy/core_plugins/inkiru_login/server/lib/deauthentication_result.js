
const DeauthenticationResultStatus = Object.freeze({

  NotHandled: 'not-handled',

  Succeeded: 'succeeded',

  Failed: 'failed',

  Redirected: 'redirected'
});

export class DeauthenticationResult {

  _status;
  _error;
  _redirectURL;

  get error() {
    return this._error;
  }

  get redirectURL() {
    return this._redirectURL;
  }

  constructor(status, { error, redirectURL } = {}) {
    this._status = status;
    this._error = error;
    this._redirectURL = redirectURL;
  }

  notHandled() {
    return this._status === DeauthenticationResultStatus.NotHandled;
  }

  succeeded() {
    return this._status === DeauthenticationResultStatus.Succeeded;
  }

  failed() {
    return this._status === DeauthenticationResultStatus.Failed;
  }

  redirected() {
    return this._status === DeauthenticationResultStatus.Redirected;
  }

  static notHandled() {
    return new DeauthenticationResult(DeauthenticationResultStatus.NotHandled);
  }

  static succeeded() {
    return new DeauthenticationResult(DeauthenticationResultStatus.Succeeded);
  }

  static failed(error) {
    if (!error) {
      throw new Error('Error should be specified.');
    }

    return new DeauthenticationResult(
      DeauthenticationResultStatus.Failed,
      { error }
    );
  }

  static redirectTo(redirectURL) {
    if (!redirectURL) {
      throw new Error('Redirect URL must be specified.');
    }

    return new DeauthenticationResult(
      DeauthenticationResultStatus.Redirected,
      { redirectURL }
    );
  }
}
