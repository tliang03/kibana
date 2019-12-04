const _sort = (arr)=>{
  arr.sort((a, b) => {
    return (a.label.toUpperCase() > b.label.toUpperCase()) ? 1 : -1;
  });
  return arr;
};

const users = (store = [], action) => {
  let newStore = [];
  if (action.type === 'SEARCH_ALL_USERS') {
    newStore = action.users.map((user) => {
      return {
        value: user,
        label: user
      };
    });

    return _sort(newStore);
  }

  return store || [];
};

export default users;
