import { createSlice } from '@reduxjs/toolkit';

export const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    search: '',
    date_range: '1800-2020',
    start_date: '1800',
    photos: 'false',
    featured: 'false',
    type: 'all',
  },
  reducers: {
    //updateFilters: (state, action) => {
    //const { type, payload } = action;
    //console.log('UPDATE FILTERS');
    //},
    updateDate: (state, action) => {
      const { payload } = action;
      //console.log('UPDATE RANGE', payload);
      state.start_date = payload;
    },
  },
});

export const { updateDate } = filtersSlice.actions;

export const selectFilterAll = (state) => state.filters;
export const selectFilterDate = (state) => state.filters.date_range;
export const selectStartDate = (state) => state.filters.start_date;

export default filtersSlice.reducer;
