export const LOGGING_INDEX = 'tools.loogings';

export const LOGGING_BODY = {
  'index': LOGGING_INDEX,
  'body': {
    'query': {
      'match_all': {}
    },
    'size': 0
  }
};
