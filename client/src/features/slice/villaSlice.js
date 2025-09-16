import { createSlice } from "@reduxjs/toolkit";

const villaSlice = createSlice({
  name: "villas",
  initialState: {
    items: [],
    villaLoading: false,
    error: null,
  },
  reducers: {
    setVillaLoading: (state, action) => {
        state.villaLoading = action.payload;
    },
    setVillas: (state, action) => {
      state.items = action.payload;
      state.villaLoading = false;
    },
    addVilla: (state, action) => {
      state.items.push(action.payload);
    },
    updateVilla: (state, action) => {
      const idx = state.items.findIndex(v => v._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    deleteVilla: (state, action) => {
      state.items = state.items.filter(v => v._id !== action.payload);
    },
    setError: (state, action) => {
        state.error = action.payload;
        state.villaLoading = false;
    },
  },
});

export const { setVillaLoading, setVillas, addVilla, updateVilla, deleteVilla, setError } = villaSlice.actions;
export default villaSlice.reducer;