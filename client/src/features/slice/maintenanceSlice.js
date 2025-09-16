import { createSlice } from "@reduxjs/toolkit";

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {
    setMaintenances: (state, action) => {
      state.items = action.payload;
    },
    addMaintenance: (state, action) => {
      state.items.push(action.payload);
    },
    updateMaintenance: (state, action) => {
      const idx = state.items.findIndex((m) => m._id === action.payload._id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      }
    },
    deleteMaintenance: (state, action) => {
      state.items = state.items.filter((m) => m._id !== action.payload);
    },
    setMaintenanceLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setMaintenances,
  addMaintenance,
  updateMaintenance,
  deleteMaintenance,
  setMaintenanceLoading,
} = maintenanceSlice.actions;

export default maintenanceSlice.reducer;
