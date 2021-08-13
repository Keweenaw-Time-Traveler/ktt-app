// import { createStore } from 'redux';
// import { composeWithDevTools } from 'redux-devtools-extension';
// import rootReducer from './reducers/rootReducer';

// const store = createStore(rootReducer, composeWithDevTools());

// export default store;

import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './reducers/dataSlice';
import filtersReducer from './reducers/filtersSlice';
import markersReducer from './reducers/markersSlice';
import landingReducer from './reducers/landingSlice';
import listReducer from './reducers/listSlice';
import mapReducer from './reducers/mapSlice';

export default configureStore({
  reducer: {
    data: dataReducer,
    filters: filtersReducer,
    markers: markersReducer,
    landing: landingReducer,
    list: listReducer,
    map: mapReducer,
  },
});
