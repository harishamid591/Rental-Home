import {configureStore} from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import villaReducer from "../features/slice/villaSlice"
import houseReducer from "../features/slice/houseSlice"
import tenantReducer from "../features/slice/tenantSlice"
import maintenanceReducer from "../features/slice/maintenanceSlice"
import electricityReducer from "../features/slice/electricitySlice"


export const store = configureStore({
    reducer:{
        auth:authReducer,
        villas: villaReducer,
        houses:houseReducer,
        tenants:tenantReducer,
        maintenance: maintenanceReducer,
        electricity:electricityReducer,
    }
})