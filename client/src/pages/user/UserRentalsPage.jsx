// src/pages/user/UserRentalsPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import Loader from "../../components/Loaders";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UserRentalsPage = () => {
  const [user, setUser] = useState(null);
  const [rentHistory, setRentHistory] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRentals = async () => {
      try {
        const res = await axios.get(`${API_URI}/api/user/rentals`, {
          withCredentials: true,
        });

        setUser(res.data.user);
        setRentHistory(res.data.history || []);
        setMaintenance(res.data.maintenance || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load rental data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRentals();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URI}/api/auth/logout`, {}, { withCredentials: true });
      toast.success("Logged out successfully");
      navigate("/"); // redirect to login
    } catch (err) {
      console.error(err);
      toast.error("Logout failed");
    }
  };

  if (loading) return <Loader />;

  // format month string like (9,2025) -> "Sep 2025"
  const formatMonth = (month, year) => {
    try {
      const date = new Date(year, month - 1, 1);
      return date.toLocaleString("default", { month: "short", year: "numeric" });
    } catch {
      return `${month}/${year}`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Logout */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Rentals</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* User & House Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">My House Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <p><span className="font-semibold">Name:</span> {user?.name || "N/A"}</p>
          <p><span className="font-semibold">Qatar ID:</span> {user?.qatarId || "N/A"}</p>
          <p><span className="font-semibold">Contact:</span> {user?.contact || "N/A"}</p>
          <p><span className="font-semibold">Villa:</span> {user?.villaName || "Not Assigned"}</p>
          <p><span className="font-semibold">House No.:</span> {user?.houseNumber || "Not Assigned"}</p>
          <p><span className="font-semibold">Monthly Rent:</span> QR {user?.rent ?? "N/A"}</p>
        </div>
      </div>

      {/* Rent History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Rent Payment History</h2>
        <div className="overflow-x-auto">
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 bg-gray-800 text-white text-sm sm:text-base">
                <tr>
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-4 py-3 text-left">Rent</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {rentHistory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-500">
                      No payment history found
                    </td>
                  </tr>
                ) : (
                  rentHistory.map((r, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50 transition">
                      <td className="px-4 py-3">{formatMonth(r.month, r.year)}</td>
                      <td className="px-4 py-3">QR {r.rentAmount}</td>
                      <td
                        className={`px-4 py-3 font-semibold ${
                          r.status === "paid"
                            ? "text-green-600"
                            : r.status === "overdue"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {r.status}
                      </td>
                      <td className="px-4 py-3">
                        {r.paidDate ? new Date(r.paidDate).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

     {/* Maintenance Requests (Read Only) */}
    {maintenance.length > 0 && (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Maintenance Details</h2>
        <div className="overflow-x-auto">
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 bg-gray-800 text-white text-sm sm:text-base">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Issue</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Cost (QR)</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.map((m, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      {m.date ? new Date(m.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">{m.issue}</td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        m.status === "Completed"
                          ? "text-green-600"
                          : m.status === "In Progress"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {m.status}
                    </td>
                    <td className="px-4 py-3">{m.cost ? `QR ${m.cost}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}


      {/* Custom Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default UserRentalsPage;
