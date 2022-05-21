import { createSlice } from '@reduxjs/toolkit';

const localStorage = JSON.parse(window.localStorage.getItem('kett_history'));
const isActive = localStorage ? true : false;

export const historySlice = createSlice({
  name: 'history',
  initialState: {
    historyActive: isActive,
    historyItems: isActive ? localStorage : [],
  },
  reducers: {
    updateHistoryItems: (state, { payload }) => {
      const notEmpty =
        Object.keys(payload).length !== 0 && payload.constructor === Object;
      state.historyActive = notEmpty;
      if (notEmpty) {
        state.historyItems.unshift(payload);
        window.localStorage.setItem(
          'kett_history',
          JSON.stringify(state.historyItems)
        );
      }
    },
    clearHistoryItems: (state) => {
      state.historyActive = false;
      state.historyItems = [];
      window.localStorage.removeItem('kett_history');
    },
  },
});

export const { updateHistoryItems, clearHistoryItems } = historySlice.actions;

export const selectHistoryActive = (state) => state.history.historyActive;
export const selectHistoryItems = (state) => state.history.historyItems;
export const selectHistoryMostRecent = (state) => state.history.historyItems[0];

export default historySlice.reducer;
