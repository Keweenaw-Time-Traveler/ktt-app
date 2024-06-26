import { createSlice } from '@reduxjs/toolkit';

export const markersSlice = createSlice({
  name: 'markers',
  initialState: {
    listLoading: true,
    length: 0,
    message: 'Loading List...',
    extent: {
      xmin: -9846895.538152626,
      xmax: -9846429.152847374,
      ymin: 5982318.612841596,
      ymax: 5982577.483558404,
    },
    active: {
      length: 0,
      people: {
        length: 0,
        results: [],
      },
      places: {
        length: 0,
        results: [],
      },
      stories: {
        length: 0,
        results: [],
      },
    },
    inactive: {
      length: 0,
      people: {
        length: 0,
        results: [],
      },
    },
  },
  reducers: {
    updateList: (state, action) => {
      //console.log('MARKER RESPONCE', action.payload.active);
      state.active = action.payload.active;
      state.length = action.payload.active.length;
      const inactive = action.payload.inactive;
      if (inactive) {
        state.inactive = inactive;
      } else {
        state.inactive = {
          length: 0,
          people: {
            length: 0,
            results: [],
          },
        };
      }
    },
    updateListMessage: (state, action) => {
      state.message = action.payload;
      if (action.payload === 'Loading List...') {
        state.listLoading = true;
      } else {
        state.listLoading = false;
      }
    },
  },
});

export const { updateList, updateListMessage } = markersSlice.actions;
export const selectLength = (state) => state.markers.length;
export const selectListMessage = (state) => state.markers.message;
export const selectListLoading = (state) => state.markers.listLoading;
export const selectPeopleData = (state) => {
  const peopleData = state.markers.active.people;
  if (peopleData) {
    return peopleData.results;
  } else {
    return [];
  }
};
export const selectPlacesData = (state) => {
  const placesData = state.markers.active.places;
  if (placesData) {
    return placesData.results;
  } else {
    return [];
  }
};
export const selectStoriesData = (state) => {
  const storiesData = state.markers.active.stories;
  if (storiesData) {
    return storiesData.results;
  } else {
    return [];
  }
};

export default markersSlice.reducer;
