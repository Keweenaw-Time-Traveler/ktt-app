import { createSlice } from '@reduxjs/toolkit';

export const dataSlice = createSlice({
  name: 'data',
  initialState: {
    markers: 'http://geospatialresearch.mtu.edu/markers.php',
  },
});

export const selectServiceMarkers = (state) => state.data.markers;

export default dataSlice.reducer;
