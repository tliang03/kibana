import { combineReducers } from 'redux';

import roles from './roles';
import dashboards from './dashboards';
import searches from './search';
import ranklist from './ranklist';
import users from './users';
import error from './error';


const rootReducer = combineReducers({
  roles,
  dashboards,
  searches,
  ranklist,
  error,
  users
});

export default rootReducer;
