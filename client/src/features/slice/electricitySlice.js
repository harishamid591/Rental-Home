// src/features/slice/electricitySlice.js
import { createSlice } from "@reduxjs/toolkit";

const electricitySlice = createSlice({
  name: "electricity",
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {
    setElectricities: (state, action) => {
      state.items = action.payload;
    },
    addElectricity: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateElectricity: (state, action) => {
      state.items = state.items.map((item) =>
        item._id === action.payload._id ? action.payload : item
      );
    },
    deleteElectricity: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    setElectricityLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
    setElectricities,
  addElectricity,
  updateElectricity,
  deleteElectricity,
  setElectricityLoading,
} = electricitySlice.actions;

export default electricitySlice.reducer;
