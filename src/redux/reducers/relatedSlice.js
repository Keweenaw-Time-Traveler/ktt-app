import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Api } from '../../config/data';

const { RELATED_CONTENT } = Api;

// First, create the thunk
export const getRelated = createAsyncThunk(
  'related/getRelated',
  async (related, { dispatch, getState }) => {
    const { id, mapyear, markerid } = related;
    console.log('RELATED REQUEST', id, mapyear, markerid);
    return axios
      .post(RELATED_CONTENT, {
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
    people: [],
    places: [],
    stories: [],
    mapRelated: false,
    activeTab: '',
  },
  reducers: {
    toggleRelated: (state, { payload }) => {
      const toggleShow = payload === 'show' ? true : false;
      const toggleRemove = payload === 'show' ? false : true;
      state.showRelated = toggleShow;
      state.removeRelated = toggleRemove;
    },
    toggleRelatedMap: (state, { payload }) => {
      state.mapRelated = payload;
    },
    setActiveTab: (state, { payload }) => {
      state.activeTab = payload;
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
      console.log('RELATED PAYLOAD', payload);
      state.people = payload.people.groups;
      state.places = payload.places.groups;
      state.stories = payload.stories.groups;
      state.total = payload.length;
      state.relatedStatus = 'success';
    });
  },
});

export const { toggleRelated, toggleRelatedMap, setActiveTab } =
  relatedSlice.actions;
export const selectShowRelated = (state) => state.related.showRelated;
export const selectRemoveRelated = (state) => state.related.removeRelated;
export const selectRelatedStatus = (state) => state.related.relatedStatus;
export const selectRelatedTotal = (state) => state.related.total;
export const selectRelatedPeople = (state) => state.related.people;
export const selectRelatedPlaces = (state) => state.related.places;
export const selectRelatedStories = (state) => state.related.stories;
export const selectMapRelated = (state) => state.related.mapRelated;
export const selectActiveTab = (state) => state.related.activeTab;

export default relatedSlice.reducer;
