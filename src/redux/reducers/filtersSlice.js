import { createSlice } from '@reduxjs/toolkit';

export const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    search: '',
    dateRange: '1800-2020',
    startDate: '1800',
    photos: 'false',
    featured: 'false',
    type: 'all',
  },
  reducers: {
    updateSearch: (state, { payload }) => {
      state.search = payload;
    },
    updateStartDate: (state, { payload }) => {
      state.startDate = payload;
    },
    updateType: (state, { payload }) => {
      state.type = payload;
    },
  },
});

export const { updateSearch, updateStartDate, updateType } =
  filtersSlice.actions;

export const selectFiltersAll = (state) => state.filters;

export default filtersSlice.reducer;
