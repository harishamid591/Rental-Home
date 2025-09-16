// src/pages/admin/Rentals/RentalPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URI } from "../../../utils/constants";
import toast from "react-hot-toast";
import Loader from "../../../components/Loaders";

const RentalPage = () => {
  const [villas, setVillas] = useState([]);
  const [selectedVilla, setSelectedVilla] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonthLabel = new Date(month + "-01").toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Load villas
  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const res = await axios.get(`${API_URI}/api/villas`, { withCredentials: true });
        setVillas(res.data);
        if (res.data.length > 0) {
          setSelectedVilla(res.data[0]._id); // default = first villa
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load villas");
      }
    };
    fetchVillas();
  }, []);

  // Load rentals based on filters
  useEffect(() => {
    const fetchRentals = async () => {
      if (!selectedVilla) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_URI}/api/rentals?villaId=${selectedVilla}&status=${statusFilter}&month=${month}`,
          { withCredentials: true }
        );
        setRentals(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load rentals");
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, [selectedVilla, statusFilter, month]);

  // Toggle paid/unpaid
  const handleToggle = async (rentalId) => {
    try {
      const res = await axios.put(
        `${API_URI}/api/rentals/${rentalId}/toggle`,
        {},
        { withCredentials: true }
      );

      const updatedRental = res.data.rental;

      setRentals((prev) =>
        prev.map((r) =>
          r.rentalId === rentalId
            ? {
                ...r,
                status: updatedRental.status,
                paidDate: updatedRental.paidDate,
              }
            : r
        )
      );

      toast.success("Status updated ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  // ===== Summary stats =====
  const totalRent = rentals.reduce((sum, r) => sum + r.rentAmount, 0);
  const paidRent = rentals
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.rentAmount, 0);
  const unpaidRent = totalRent - paidRent;

  const totalTenants = rentals.length;
  const paidCount = rentals.filter((r) => r.status === "paid").length;
  const unpaidCount = totalTenants - paidCount;

  if (loading) return <Loader />;

  return (
    <div className="p-4 sm:p-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Rentals – {currentMonthLabel}</h1>

        <div className="flex flex-wrap gap-3">
          {/* Villa dropdown */}
          <select
            value={selectedVilla}
            onChange={(e) => setSelectedVilla(e.target.value)}
            className="border px-3 py-2 rounded-md cursor-pointer"
          >
            {villas.map((villa) => (
              <option key={villa._id} value={villa._id}>
                {villa.name}
              </option>
            ))}
          </select>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded-md cursor-pointer"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          {/* Month dropdown (native month picker) */}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-3 py-2 rounded-md cursor-pointer"
          />
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Rent</h3>
          <p className="text-xl font-bold text-gray-800">QR {totalRent}</p>
          <span className="text-sm text-gray-400">{totalTenants} tenants</span>
        </div>

        <div className="bg-green-50 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-600">Paid</h3>
          <p className="text-xl font-bold text-green-700">QR {paidRent}</p>
          <span className="text-sm text-green-500">{paidCount} tenants</span>
        </div>

        <div className="bg-red-50 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-600">Unpaid</h3>
          <p className="text-xl font-bold text-red-700">QR {unpaidRent}</p>
          <span className="text-sm text-red-500">{unpaidCount} tenants</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-800 text-white text-sm sm:text-base">
              <th className="px-4 py-3 text-left">Tenant</th>
              <th className="px-4 py-3 text-left">Villa</th>
              <th className="px-4 py-3 text-left">House</th>
              <th className="px-4 py-3 text-left">Rent</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rentals.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No rental records found
                </td>
              </tr>
            ) : (
              rentals.map((r) => (
                <tr key={r.rentalId} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{r.tenantName}</td>
                  <td className="px-4 py-3">{r.villaName}</td>
                  <td className="px-4 py-3">{r.houseNumber}</td>
                  <td className="px-4 py-3">QR {r.rentAmount}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      r.status === "paid" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {r.status}
                  </td>
                  <td className="px-4 py-3">
                    {r.paidDate ? new Date(r.paidDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={r.status === "paid"}
                        onChange={() => handleToggle(r.rentalId)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-red-500 rounded-full peer peer-checked:bg-green-500"></div>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalPage;
