import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';

export default function configureStore() {
  const createStoreWithMiddleware = applyMiddleware(
    thunk
  )(createStore);

  const store = createStoreWithMiddleware(rootReducer);
  return store;
}
