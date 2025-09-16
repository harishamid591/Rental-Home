import { createSlice } from "@reduxjs/toolkit";

const houseSlice = createSlice({
  name: "houses",
  initialState: {
    list: [],
  },
  reducers: {
    setHouses: (state, action) => {
      state.list = action.payload;
    },
    addHouse: (state, action) => {
      state.list.push(action.payload);
    },
    updateHouse: (state, action) => {
      const index = state.list.findIndex(h => h._id === action.payload._id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteHouse: (state, action) => {
      state.list = state.list.filter(h => h._id !== action.payload);
    },
  },
});

export const { setHouses, addHouse, updateHouse, deleteHouse } = houseSlice.actions;
export default houseSlice.reducer;
