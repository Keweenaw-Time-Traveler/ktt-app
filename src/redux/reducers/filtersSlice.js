import { createSlice } from '@reduxjs/toolkit';

export const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    search: '',
    dateRange: '1800-2020',
    startDate: '1800',
    endDate: '2020',
    location: 'Keweenaw',
    photos: 'false',
    featured: 'false',
    type: 'all',
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
  },
});

export const {
  updateSearch,
  updateDateRange,
  updateStartDate,
  updateEndDate,
  updateType,
  updatePhotos,
} = filtersSlice.actions;

export const selectFiltersAll = (state) => state.filters;

export default filtersSlice.reducer;
