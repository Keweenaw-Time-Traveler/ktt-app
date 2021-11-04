import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// First, create the thunk
export const getDetails = createAsyncThunk(
  'details/getDetails',
  async (details, { dispatch, getState }) => {
    const { id, recnumber } = details;
    return axios
      .post('http://geospatialresearch.mtu.edu/full_details.php', {
        personid: id,
        recnumber: recnumber,
      })
      .then((res) => {
        return res.data;
      });
  }
);

// Then, handle actions in your reducers:
export const detailsSlice = createSlice({
  name: 'details',
  initialState: {
    showDetails: false,
    removeDetails: true,
    detailsStatus: 'idle',
    name: '',
    sources: [],
  },
  reducers: {
    toggleDetails: (state, action) => {
      const { payload } = action;
      const toggleShow = payload === 'show' ? true : false;
      const toggleRemove = payload === 'show' ? false : true;
      state.showDetails = toggleShow;
      state.removeDetails = toggleRemove;
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(getDetails.pending, (state, action) => {
      state.detailsStatus = 'idle';
    });
    builder.addCase(getDetails.fulfilled, (state, action) => {
      // Add details to the state array
      // Update status
      console.log('DETAILS', action.payload);
      state.name = action.payload.person_details[0].value;
      state.sources = action.payload.sources.map((source) => {
        return { value: source.recnumber, label: source.recname };
      });
      state.details = action.payload;
      state.detailsStatus = 'success';
    });
  },
});

export const { toggleDetails } = detailsSlice.actions;
export const selectShowDetails = (state) => state.details.showDetails;
export const selectRemoveDetails = (state) => state.details.removeDetails;
export const selectDetailsStatus = (state) => state.details.detailsStatus;
export const selectDetails = (state) => state.details.details;
export const selectDetailsName = (state) => state.details.name;
export const selectDetailsSources = (state) => state.details.sources;

export default detailsSlice.reducer;
