// src/routes/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import VillaList from "../pages/admin/Villas/VillaList";
import HouseList from "../pages/admin/Houses/HouseList";
import TenantList from "../pages/admin/Tenants/TenantList";
import RentStatus from "../pages/admin/Rentals/RentStatus";
import MaintenanceList from "../pages/admin/Maintenance/MaintenanceList";
import Analytics from "../pages/admin/Analytics";
import ElectricityPage from "../pages/admin/ElectricityPage";


const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="villas" element={<VillaList />} />
        <Route path="houses" element={<HouseList />} />
        <Route path="tenants" element={<TenantList />} />
        <Route path="rentals" element={<RentStatus />} />
        <Route path="maintenance" element={<MaintenanceList />} />
        <Route path="electricity" element={<ElectricityPage />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
