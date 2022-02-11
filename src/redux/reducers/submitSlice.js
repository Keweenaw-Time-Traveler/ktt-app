import { createSlice } from '@reduxjs/toolkit';

export const submitSlice = createSlice({
  name: 'submit',
  initialState: {
    showSubmit: false,
    removeSubmit: true,
  },
  reducers: {
    toggleSubmit: (state, action) => {
      const { payload } = action;
      const toggleShow = payload === 'show' ? true : false;
      const toggleRemove = payload === 'show' ? false : true;
      state.showSubmit = toggleShow;
      state.removeSubmit = toggleRemove;
    },
  },
});

export const { toggleSubmit } = submitSlice.actions;
export const selectShowSubmit = (state) => state.submit.showSubmit;
export const selectRemoveSubmit = (state) => state.submit.removeSubmit;

export default submitSlice.reducer;
