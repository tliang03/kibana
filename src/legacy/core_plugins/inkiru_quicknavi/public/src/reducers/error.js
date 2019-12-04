const error = (store = null, action) => {

  switch (action.level) {
    case 'ERROR':

      return action.errormsg || null;

    default:
      return store;
  }
};

export default error;
