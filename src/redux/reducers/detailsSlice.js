import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// First, create the thunk
export const getDetails = createAsyncThunk(
  'details/getDetails',
  async ({}, { dispatch, getState }) => {
    //const stateBefore = getState();
    return axios
      .post('http://geospatialresearch.mtu.edu/full_details.php', {
        personid: '610EDD82-DAD2-431A-B27D-359CC4CA1DFF',
        recnumber: '14446419CENSUS1930',
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
      // Add list to the state array
      // Update status
      //state.entities = action.payload;
      state.detailsStatus = 'success';
    });
  },
});

export const { toggleDetails } = detailsSlice.actions;
export const selectShowList = (state) => state.details.showDetails;
export const selectRemoveList = (state) => state.details.removeDetails;
export const selectDetailsStatus = (state) => state.details.detailsStatus;

export default detailsSlice.reducer;
