import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const markersSlice = createSlice({
  name: 'markers',
  initialState: {
    hasLoaded: false,
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
    updateMarkers: (state, action) => {
      console.log('MARKER PAYLOAD', action.payload);
      state.active = action.payload.active;
      state.length = action.payload.active.length;
      state.inactive = action.payload.inactive;
    },
    updateMakerMessage: (state, action) => {
      state.message = action.payload;
    },
  },
});

//const { updateMarkers, setHasLoaded } = markersSlice.actions;

export function loadMarkersAsync(filters) {
  console.log('ASYNC');
  const { search, date_range, photos, featured, type } = filters;
  return function (dispatch, getState) {
    //dispatch(setHasLoaded(false));
    const extent = getState().markers.extent;
    axios
      .post('http://geospatialresearch.mtu.edu/markers.php', {
        search: search,
        geometry: {
          xmin: extent.xmin,
          ymin: extent.ymin,
          xmax: extent.xmax,
          ymax: extent.ymax,
          spatialReference: { wkid: 3857 },
        },
        filters: {
          date_range: date_range,
          photos: photos,
          featured: featured,
          type: type,
        },
      })
      .then((res) => {
        //dispatch(updateMarkers(res.data));
        //return res.data;
      });
  };
}

export const { updateMarkers, updateMakerMessage } = markersSlice.actions;
export const selectLength = (state) => state.markers.length;
export const selectMarkerMessage = (state) => state.markers.message;
export const selectPeopleData = (state) => state.markers.active.people.results;
export const selectStoriesData = (state) =>
  state.markers.active.stories.results;
export const selectHasLoaded = (state) => state.markers.hasLoaded;

export default markersSlice.reducer;
