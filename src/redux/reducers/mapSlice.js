import { createSlice } from '@reduxjs/toolkit';

export const mapSlice = createSlice({
  name: 'map',
  initialState: {
    showMap: false,
  },
  reducers: {
    updateMapView: (state, { payload }) => {
      state.showMap = payload;
    },
  },
});

export const { updateMapView } = mapSlice.actions;

export const selectShowMap = (state) => state.map.showMap;

export default mapSlice.reducer;
