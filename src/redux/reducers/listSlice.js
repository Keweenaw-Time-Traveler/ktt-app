import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// First, create the thunk
export const getList = createAsyncThunk(
  'list/getList',
  async (arg, { dispatch, getState }) => {
    const stateBefore = getState();
    const search = stateBefore.filters.search;
    const filters = {
      date_range: stateBefore.filters.dateRange,
      photos: stateBefore.filters.photos,
      featured: 'false',
      type: stateBefore.filters.type,
    };
    console.log('LIST SEARCH VALUE', search);
    console.log('LIST FILTER VALUES', filters);
    return axios
      .post('http://geospatialresearch.mtu.edu/list.php', {
        search,
        geometry: null,
        filters,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => console.log(error));
  }
);

// Then, handle actions in your reducers:
export const listSlice = createSlice({
  name: 'list',
  initialState: {
    showList: false,
    removeList: true,
    listItemId: { recnumber: '', loctype: '' },
    entities: {
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
    },
    listStatus: 'idle',
  },
  reducers: {
    toggleList: (state, action) => {
      const { payload } = action;
      const toggleShow = payload === 'show' ? true : false;
      const toggleRemove = payload === 'show' ? false : true;
      state.showList = toggleShow;
      state.removeList = toggleRemove;
    },
    updateListItem: (state, action) => {
      const { payload } = action;
      console.log('UPDATE LIST ITEM', payload);
      state.listItemId = payload;
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(getList.pending, (state, action) => {
      state.listStatus = 'idle';
    });
    builder.addCase(getList.fulfilled, (state, action) => {
      // Add list to the state array
      // Update status
      state.entities = action.payload;
      state.listStatus = 'success';
    });
  },
});

export const { toggleList, updateListItem } = listSlice.actions;
export const selectShowList = (state) => state.list.showList;
export const selectRemoveList = (state) => state.list.removeList;
export const selectAllList = (state) => state.list.entities;
export const selectListStatus = (state) => state.list.listStatus;
export const selectActiveItem = (state) => state.list.listItemId;

export default listSlice.reducer;
