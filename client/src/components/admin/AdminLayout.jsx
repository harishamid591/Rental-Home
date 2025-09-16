import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react"; // added logout icon
import { useDispatch } from "react-redux";
import { clearUser } from "../../features/auth/authSlice"; // adjust path

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearUser());
    navigate("/"); // redirect to login
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-gray-900 text-white p-4 flex flex-col justify-between transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}
      >
        <div>
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
          <nav className="space-y-3">
            {[
              { path: "/admin/dashboard", label: "Dashboard" },
              { path: "/admin/villas", label: "Villas" },
              { path: "/admin/houses", label: "Houses" },
              { path: "/admin/tenants", label: "Tenants" },
              { path: "/admin/rentals", label: "Rentals" },
              { path: "/admin/maintenance", label: "Maintenance" },
              { path: "/admin/electricity", label: "Electricity" },
              { path: "/admin/analytics", label: "Analytics" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block hover:bg-gray-800 px-2 py-1 rounded"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mt-6 bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-45 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 w-full overflow-y-auto">
        {/* Top bar (mobile only) */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-900 text-white shadow-sm lg:hidden">
          <button
            className="text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <h2 className="text-lg font-bold">Admin Panel</h2>
          {/* Mobile logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm bg-red-700 hover:bg-red-800 px-2 py-1 rounded cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
