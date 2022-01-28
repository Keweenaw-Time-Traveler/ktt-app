import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// First, create the thunk
export const getDetails = createAsyncThunk(
  'details/getDetails',
  async (details, { dispatch, getState }) => {
    //console.log('GET DETAILS THUNK', details);
    const { id, recnumber, loctype } = details;
    return axios
      .post('http://geospatialresearch.mtu.edu/full_details.php', {
        personid: id,
        recnumber: recnumber,
        loctype: loctype,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => console.log(error));
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
    sources: null,
    data: null,
    attachments: null,
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
      state.name = action.payload.title;
      state.id = action.payload.id;
      state.type = action.payload.type;
      state.sources = action.payload.sources.map((source, index) => {
        return {
          value: index,
          label: source.recname,
          id: source.recname,
          x: source.x,
          y: source.y,
          recnumber: source.recnumber,
          markerid: source.markerid,
          loctype: source.loctype,
          mapyear: source.map_year,
          selected: source.selected,
        };
      });
      state.details = action.payload;
      state.detailsStatus = 'success';
      state.data = action.payload.data;
      state.attachments = action.payload.attachments;
    });
  },
});

export const { toggleDetails } = detailsSlice.actions;
export const selectShowDetails = (state) => state.details.showDetails;
export const selectRemoveDetails = (state) => state.details.removeDetails;
export const selectDetailsStatus = (state) => state.details.detailsStatus;
export const selectDetails = (state) => state.details.details;
export const selectDetailsName = (state) => state.details.name;
export const selectDetailsId = (state) => state.details.id;
export const selectDetailsType = (state) => state.details.type;
export const selectDetailsSources = (state) => state.details.sources;
export const selectDetailsData = (state) => state.details.data;
export const selectDetailsAttachments = (state) => state.details.attachments;

export default detailsSlice.reducer;
