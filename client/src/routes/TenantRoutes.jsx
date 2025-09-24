import { Route, Routes } from "react-router-dom"
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "../pages/user/Dashboard";
import UserRentalsPage from "../pages/user/UserRentalsPage";


const TenantRoutes = ()=>{
    return(
        <Routes>
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["tenant"]}>
                        <UserRentalsPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}

export default TenantRoutes;