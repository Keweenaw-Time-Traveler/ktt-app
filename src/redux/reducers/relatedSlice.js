import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// First, create the thunk
export const getRelated = createAsyncThunk(
  'related/getRelated',
  async (related, { dispatch, getState }) => {
    const { id, mapyear, markerid } = related;
    return axios
      .post('http://geospatialresearch.mtu.edu/related_content.php', {
        id: id,
        mapyear: mapyear,
        markerid: markerid,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => console.log(error));
  }
);

// Then, handle actions in your reducers:
export const relatedSlice = createSlice({
  name: 'related',
  initialState: {
    showRelated: false,
    removeRelated: true,
    relatedStatus: 'idle',
    total: '',
    people: null,
    places: null,
    stories: null,
  },
  reducers: {
    toggleRelated: (state, action) => {
      const { payload } = action;
      const toggleShow = payload === 'show' ? true : false;
      const toggleRemove = payload === 'show' ? false : true;
      state.showRelated = toggleShow;
      state.removeRelated = toggleRemove;
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(getRelated.pending, (state, action) => {
      state.relatedStatus = 'idle';
    });
    builder.addCase(getRelated.fulfilled, (state, action) => {
      // Add details to the state array
      // Update status
      const { payload } = action;
      console.log('RELATED', payload);
      state.people = payload.people.groups;
      //state.places = payload.places.groups;
      //state.stories = payload.stories.groups;
      state.total = payload.length;
      state.relatedStatus = 'success';
    });
  },
});

export const { toggleRelated } = relatedSlice.actions;
export const selectShowRelated = (state) => state.related.showRelated;
export const selectRemoveRelated = (state) => state.related.removeRelated;
export const selectRelatedStatus = (state) => state.related.relatedStatus;
export const selectRelatedTotal = (state) => state.related.total;
export const selectRelatedPeople = (state) => state.related.people;

export default relatedSlice.reducer;
