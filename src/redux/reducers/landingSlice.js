import { createSlice } from '@reduxjs/toolkit';

export const landingSlice = createSlice({
  name: 'landing',
  initialState: {
    showLanding: true,
    removeLanding: false,
    showToolTips: false,
  },
  reducers: {
    updateLandingView: (state, action) => {
      const { payload } = action;
      state.showLanding = payload.show;
      state.removeLanding = payload.remove;
    },
    turnOnToolTips: (state, action) => {
      const { payload } = action;
      state.showToolTips = payload;
    },
  },
});

export const { updateLandingView, turnOnToolTips } = landingSlice.actions;

export const selectShowLanding = (state) => state.landing.showLanding;
export const selectRemoveLanding = (state) => state.landing.removeLanding;
export const selectShowToolTips = (state) => state.landing.showToolTips;

export default landingSlice.reducer;
