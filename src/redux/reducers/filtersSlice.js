import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Thunks
export const getPlaceName = createAsyncThunk(
  'filters/getPlaceName',
  async (geometry, { dispatch, getState }) => {
    return axios
      .get(
        'https://portal1-geo.sabu.mtu.edu/server/rest/services/KeweenawHSDI/cchsdi_placenames/FeatureServer/0/query',
        {
          params: {
            geometry,
            returnGeometry: false,
            f: 'pjson',
          },
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((error) => console.log(error));
  }
);

export const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    search: '',
    dateRange: '1800-2020',
    startDate: '1800',
    endDate: '2020',
    photos: 'false',
    featured: 'false',
    type: 'everything',
    placeNameStatus: 'idle',
    placeName: 'Keweenaw',
    hide: true,
  },
  reducers: {
    updateSearch: (state, { payload }) => {
      state.search = payload;
    },
    updateDateRange: (state, { payload }) => {
      state.dateRange = payload;
    },
    updateStartDate: (state, { payload }) => {
      state.startDate = payload;
    },
    updateEndDate: (state, { payload }) => {
      state.endDate = payload;
    },
    updateType: (state, { payload }) => {
      state.type = payload;
    },
    updatePhotos: (state, { payload }) => {
      state.photos = payload;
    },
    updateHide: (state, { payload }) => {
      state.hide = payload;
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(getPlaceName.pending, (state, action) => {
      state.placeNameStatus = 'idle';
    });
    builder.addCase(getPlaceName.fulfilled, (state, action) => {
      //Process the place name data
      const names = action.payload.features;
      // Add reponce data to the state array
      // Update status
      if (names.length === 1) {
        state.placeName = names[0].attributes.region_nam;
      } else {
        state.placeName = 'Keweenaw';
      }
      state.placeNameStatus = 'success';
    });
  },
});

export const {
  updateSearch,
  updateDateRange,
  updateStartDate,
  updateEndDate,
  updateType,
  updatePhotos,
  updateHide,
} = filtersSlice.actions;

export const selectFiltersAll = (state) => state.filters;
export const selectFiltersHide = (state) => state.filters.hide;

export default filtersSlice.reducer;
