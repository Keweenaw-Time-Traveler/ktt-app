import { createSlice } from '@reduxjs/toolkit';

export const historySlice = createSlice({
  name: 'history',
  initialState: {
    historyActive: false,
    historyItems: [],
  },
  reducers: {
    updateHistoryItems: (state, { payload }) => {
      console.log('PAYLOAD', payload);
      const notEmpty =
        Object.keys(payload).length !== 0 && payload.constructor === Object;
      state.historyActive = notEmpty;
      if (notEmpty) {
        state.historyItems.unshift(payload);
      }
    },
    clearHistoryItems: (state) => {
      state.historyActive = false;
      state.historyItems = [];
    },
  },
});

export const { updateHistoryItems, clearHistoryItems } = historySlice.actions;

export const selectHistoryActive = (state) => state.history.historyActive;
export const selectHistoryItems = (state) => state.history.historyItems;

export default historySlice.reducer;
