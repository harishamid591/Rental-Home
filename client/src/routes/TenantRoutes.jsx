import { Route, Routes } from "react-router-dom"
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "../pages/user/Dashboard";


const TenantRoutes = ()=>{
    return(
        <Routes>
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["TENANT"]}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}

export default TenantRoutes;