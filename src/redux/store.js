import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './reducers/dataSlice';
import filtersReducer from './reducers/filtersSlice';
import markersReducer from './reducers/markersSlice';
import landingReducer from './reducers/landingSlice';
import listReducer from './reducers/listSlice';
import detailsReducer from './reducers/detailsSlice';
import mapReducer from './reducers/mapSlice';
import timelineReducer from './reducers/timelineSlice';

export default configureStore({
  reducer: {
    data: dataReducer,
    filters: filtersReducer,
    markers: markersReducer,
    landing: landingReducer,
    list: listReducer,
    details: detailsReducer,
    map: mapReducer,
    timeline: timelineReducer,
  },
});
