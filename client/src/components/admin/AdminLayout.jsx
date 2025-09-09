import { Outlet, Link } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-3">
          <Link to="/admin/dashboard" className="block hover:underline">Dashboard</Link>
          <Link to="/admin/villas" className="block hover:underline">Villas</Link>
          <Link to="/admin/houses" className="block hover:underline">Houses</Link>
          <Link to="/admin/tenants" className="block hover:underline">Tenants</Link>
          <Link to="/admin/rentals" className="block hover:underline">Rentals</Link>
          <Link to="/admin/maintenance" className="block hover:underline">Maintenance</Link>
          <Link to="/admin/notifications" className="block hover:underline">Notifications</Link>
          <Link to="/admin/analytics" className="block hover:underline">Analytics</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
