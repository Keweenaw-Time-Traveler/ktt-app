import { createSlice } from '@reduxjs/toolkit';

export const submitSlice = createSlice({
  name: 'submit',
  initialState: {
    showSubmit: false,
    removeSubmit: true,
    relatedSubmit: null,
  },
  reducers: {
    toggleSubmit: (state, action) => {
      const { payload } = action;
      const toggleShow = payload.visibility === 'show' ? true : false;
      const toggleRemove = payload.visibility === 'show' ? false : true;
      state.showSubmit = toggleShow;
      state.removeSubmit = toggleRemove;
      state.relatedSubmit = payload.id;
    },
  },
});

export const { toggleSubmit } = submitSlice.actions;
export const selectShowSubmit = (state) => state.submit.showSubmit;
export const selectRemoveSubmit = (state) => state.submit.removeSubmit;
export const selectSubmitRelated = (state) => state.submit.relatedSubmit;

export default submitSlice.reducer;
