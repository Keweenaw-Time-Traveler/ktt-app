import { createSlice } from '@reduxjs/toolkit';

const localStorage = JSON.parse(window.localStorage.getItem('history'));
const isActive = localStorage ? true : false;

export const historySlice = createSlice({
  name: 'history',
  initialState: {
    historyActive: isActive,
    historyItems: isActive ? localStorage : [],
  },
  reducers: {
    updateHistoryItems: (state, { payload }) => {
      console.log('PAYLOAD', payload);
      const notEmpty =
        Object.keys(payload).length !== 0 && payload.constructor === Object;
      state.historyActive = notEmpty;
      if (notEmpty) {
        state.historyItems.unshift(payload);
        window.localStorage.setItem(
          'history',
          JSON.stringify(state.historyItems)
        );
      }
    },
    clearHistoryItems: (state) => {
      state.historyActive = false;
      state.historyItems = [];
      window.localStorage.removeItem('history');
    },
  },
});

export const { updateHistoryItems, clearHistoryItems } = historySlice.actions;

export const selectHistoryActive = (state) => state.history.historyActive;
export const selectHistoryItems = (state) => state.history.historyItems;

export default historySlice.reducer;
