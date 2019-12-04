import Boom from 'boom';

export function wrapError(error: any) {
  return Boom.boomify(error, { statusCode: getErrorStatusCode(error) });
}

export function getErrorStatusCode(error: any): number {
  return Boom.isBoom(error) ? error.output.statusCode : error.statusCode || error.status;
}
