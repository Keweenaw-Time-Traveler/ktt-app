import axios from 'axios';
import $ from 'jquery';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Api } from '../../config/data';

const { DATE_PICKER } = Api;

// Thunks
export const getTimeline = createAsyncThunk(
  'timeline/getTimeline',
  async (arg, { dispatch, getState }) => {
    return axios
      .post(DATE_PICKER)
      .then((res) => {
        return res.data;
      })
      .catch((error) => console.log(error));
  }
);

// Reducers
export const timelineSlice = createSlice({
  name: 'timeline',
  initialState: {
    timelineData: {
      min: 0,
      max: 0,
      segments: [],
    },
    segmentData: [],
    activeSegment: null,
    activeUrl: null,
    leftPip: '0',
    rightPip: '100%',
    timelineStatus: 'idle',
    timelineRange: '',
    reset: false,
    chooserValue: null,
  },
  reducers: {
    updateTimelineRange: (state, action) => {
      state.timelineRange = action.payload;
    },
    updateActiveSegment: (state, action) => {
      state.activeSegment = action.payload;
    },
    updateActiveUrl: (state, action) => {
      state.activeUrl = action.payload;
    },
    updateLeftPip: (state, action) => {
      state.leftPip = action.payload;
    },
    updateRightPip: (state, action) => {
      state.rightPip = action.payload;
    },
    updateReset: (state, action) => {
      state.reset = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(getTimeline.pending, (state, action) => {
      state.timelineStatus = 'idle';
    });
    builder.addCase(getTimeline.fulfilled, (state, action) => {
      //stash map year on timeline
      $('#date-range').data('mapyear', action.map_year);
      //Process the segments data
      const min = action.payload.min;
      const max = action.payload.max;
      const total = max - min;
      const segmentData = action.payload.segments;
      const segments = [];
      let prevPercent = 0;
      const segmentNum = segmentData.length;
      segmentData.forEach((segment, index) => {
        const segmentMin = segment.min;
        const segmentMax = segment.max;
        const segmentTotal = segmentMax - segmentMin;
        const segmentPercent = (segmentTotal / total) * 100;
        const left = `${prevPercent}%`;
        const right =
          segmentNum === index + 1
            ? '100%'
            : `${prevPercent + segmentPercent}%`;
        prevPercent = prevPercent + segmentPercent;
        segments.push({
          id: index + 1,
          size: segmentPercent,
          left,
          right,
          dateMin: segmentMin,
          dateMax: segmentMax,
          title: segment.title,
          url: segment.url,
        });
      });
      // Add reponce data to the state array
      // Add timeline raw data
      // Add processed segment data
      // Update status
      state.timelineData = action.payload;
      state.timelineRange = `${min}-${max}`;
      state.segmentData = segments;
      state.timelineStatus = 'success';
    });
  },
});

export const {
  updateTimelineRange,
  updateActiveSegment,
  updateActiveUrl,
  updateLeftPip,
  updateRightPip,
  updateReset,
} = timelineSlice.actions;
export const selectTimeline = (state) => state.timeline.timelineData;
export const selectTimelineRange = (state) => state.timeline.timelineRange;
export const selectSegments = (state) => state.timeline.segmentData;
export const selectActiveSegment = (state) => state.timeline.activeSegment;
export const selectActiveUrl = (state) => state.timeline.activeUrl;
export const selectLeft = (state) => state.timeline.leftPip;
export const selectRight = (state) => state.timeline.rightPip;
export const selectTimelineStatus = (state) => state.timeline.timelineStatus;
export const selectReset = (state) => state.timeline.reset;

export default timelineSlice.reducer;
