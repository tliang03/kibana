
const users = (store = [], action) => {
  let newStore = [];
  if (action.type === 'SEARCH_ALL_USERS') {
    newStore = action.users.map((user) => {
      return {
        value: user,
        label: user
      };
    });

    return newStore;
  }

  return store || [];
};

export default users;
