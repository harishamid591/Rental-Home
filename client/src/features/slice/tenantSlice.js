import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
};

const tenantSlice = createSlice({
  name: "tenants",
  initialState,
  reducers: {
    setTenants: (state, action) => {
      state.list = action.payload;
    },
    addTenant: (state, action) => {
      state.list.push(action.payload);
    },
    updateTenant: (state, action) => {
      const index = state.list.findIndex(t => t._id === action.payload._id);
      if (index !== -1) state.list[index] = action.payload;
    },
    deleteTenant: (state, action) => {
      state.list = state.list.filter(t => t._id !== action.payload);
    },
  },
});

export const { setTenants, addTenant, updateTenant, deleteTenant } = tenantSlice.actions;
export default tenantSlice.reducer;
