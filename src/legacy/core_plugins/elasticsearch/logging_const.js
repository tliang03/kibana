
const getSuffix = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);

  return '-m' + year + month;

};

export const getLoggingIndex = () => {
  return 'fa-' + 'tools.loggings' + getSuffix();
};


export const LOGGING_BODY = {
  'index': getLoggingIndex(),
  'body': {
    'query': {
      'match_all': {}
    },
    'size': 0
  }
};
