import { createSlice } from '@reduxjs/toolkit';

export const mapSlice = createSlice({
  name: 'map',
  initialState: {
    showMap: false,
    loadingMarkers: true,
  },
  reducers: {
    updateMapView: (state, { payload }) => {
      state.showMap = payload;
    },
    setMarkersLoading: (state, { payload }) => {
      state.loadingMarkers = payload;
    },
  },
});

export const { updateMapView, setMarkersLoading } = mapSlice.actions;

export const selectShowMap = (state) => state.map.showMap;
export const selectMarkersLoading = (state) => state.map.loadingMarkers;

export default mapSlice.reducer;
