import { useEffect, useState } from "react";
import axios from "axios";
import { API_URI } from "../../../utils/constants";
import toast from "react-hot-toast";
import Loader from "../../../components/Loaders";
import { useDispatch, useSelector } from "react-redux";
import {
  setMaintenances,
  addMaintenance,
  updateMaintenance,
  deleteMaintenance,
  setMaintenanceLoading,
} from "../../../features/slice/maintenanceSlice";
import Swal from "sweetalert2";

const MaintenancePage = () => {
  const dispatch = useDispatch();
  const { items: maintenances, loading } = useSelector((state) => state.maintenance);

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const currentMonthLabel = new Date(month + "-01").toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [villas, setVillas] = useState([]);
  const [houses, setHouses] = useState([]);
  const [form, setForm] = useState({
    villaId: "",
    houseId: "",
    tenantName: "",
    date: "",
    issue: "",
    cost: "",
  });

  // Fetch maintenances
  const fetchMaintenances = async () => {
    dispatch(setMaintenanceLoading(true));
    try {
      const res = await axios.get(`${API_URI}/api/maintenance?month=${month}`, {
        withCredentials: true,
      });
      dispatch(setMaintenances(res.data));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load maintenances");
    } finally {
      dispatch(setMaintenanceLoading(false));
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, [month]);

  // Fetch villas
  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const res = await axios.get(`${API_URI}/api/villas`, { withCredentials: true });
        setVillas(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load villas");
      }
    };
    fetchVillas();
  }, []);

  // Fetch houses when villa changes
  useEffect(() => {
    if (!form.villaId) return;
    const fetchHouses = async () => {
      try {
        const res = await axios.get(`${API_URI}/api/houses?villaId=${form.villaId}`, {
          withCredentials: true,
        });
        setHouses(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load houses");
      }
    };
    fetchHouses();
  }, [form.villaId]);

  // Auto-set tenant name when house selected
  useEffect(() => {
    if (!form.houseId) return;
    const selectedHouse = houses.find((h) => h._id === form.houseId);
    if (selectedHouse && selectedHouse.currentTenantUserId) {
      setForm((prev) => ({
        ...prev,
        tenantName: selectedHouse.currentTenantUserId.name,
      }));
    } else {
      setForm((prev) => ({ ...prev, tenantName: "" }));
    }
  }, [form.houseId, houses]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add / Edit
  const handleSubmit = async () => {
    if (!form.villaId || !form.houseId || !form.date || !form.issue || !form.cost) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      if (editingId) {
        const res = await axios.put(`${API_URI}/api/maintenance/${editingId}`, form, {
          withCredentials: true,
        });
        dispatch(updateMaintenance(res.data));
        toast.success("Maintenance record updated ✅");
      } else {
        const res = await axios.post(`${API_URI}/api/maintenance`, form, {
          withCredentials: true,
        });
        dispatch(addMaintenance(res.data));
        toast.success("Maintenance record added ✅");
      }

      setIsModalOpen(false);
      setEditingId(null);
      setForm({ villaId: "", houseId: "", tenantName: "", date: "", issue: "", cost: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save maintenance");
    }
  };

  // Edit
  const handleEdit = async (m) => {
    setEditingId(m._id);

    // 1. Find villaId
    const villaMatch = villas.find((v) => v.name === m.villaName);
    const villaId = villaMatch ? villaMatch._id : "";

    let houseId = "";

    if (villaId) {
      try {
        // 2. Fetch houses for this villa
        const res = await axios.get(`${API_URI}/api/houses?villaId=${villaId}`, {
          withCredentials: true,
        });
        setHouses(res.data);

        // 3. Match house by number
        const houseMatch = res.data.find((h) => h.number === m.houseNumber);
        houseId = houseMatch ? houseMatch._id : "";
      } catch (err) {
        console.error(err);
        toast.error("Failed to load houses for editing");
      }
    }

    // 4. Set form
    setForm({
      villaId,
      houseId,
      tenantName: m.tenantName,
      date: m.date ? new Date(m.date).toISOString().split("T")[0] : "",
      issue: m.issue,
      cost: m.cost,
    });

    setIsModalOpen(true);
  };

  // Delete
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URI}/api/maintenance/${id}`, { withCredentials: true });
          toast.success("Maintenance record deleted ❌");
          fetchMaintenances();
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete maintenance");
        }
      }
    });
  };


  const totalCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);

  if (loading) return <Loader />;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
        <h1 className="text-2xl font-bold text-gray-800">
          Maintenance Records – {currentMonthLabel}
        </h1>

        <div className="flex flex-wrap gap-3">
          {/* Month filter */}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-3 py-2 rounded-md cursor-pointer"
          />

          <button
            onClick={() => {
              setEditingId(null);
              setForm({
                villaId: "",
                houseId: "",
                tenantName: "",
                date: "",
                issue: "",
                cost: "",
              });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white cursor-pointer px-4 py-2 rounded-md shadow hover:bg-blue-700"
          >
            Add Maintenance
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mb-6">
        <div className="bg-blue-50 border text-center border-blue-200 rounded-lg p-4 shadow-sm">
          <p className="text-gray-600 text-sm">Total Maintenance Cost</p>
          <h2 className="text-2xl font-bold text-blue-700">QR {totalCost}</h2>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-800 text-white text-sm sm:text-base">
              <th className="px-4 py-3 text-left">Villa</th>
              <th className="px-4 py-3 text-left">House</th>
              <th className="px-4 py-3 text-left">Tenant</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Issue</th>
              <th className="px-4 py-3 text-left">Cost (QR)</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenances.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No maintenance records found
                </td>
              </tr>
            ) : (
              maintenances.map((m) => (
                <tr key={m._id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{m.villaName}</td>
                  <td className="px-4 py-3">{m.houseNumber}</td>
                  <td className="px-4 py-3">{m.tenantName}</td>
                  <td className="px-4 py-3">{new Date(m.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{m.issue}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">QR {m.cost}</td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(m)}
                      className="px-3 py-1 bg-blue-500 cursor-pointer text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="px-3 py-1 bg-red-500 text-white cursor-pointer rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Maintenance" : "Add Maintenance"}
            </h2>

            {/* Row 1: Villa + House */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">Villa</label>
                <select
                  name="villaId"
                  value={form.villaId}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md"
                >
                  <option value="">Select Villa</option>
                  {villas.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">House Number</label>
                <select
                  name="houseId"
                  value={form.houseId}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md"
                  disabled={!form.villaId}
                >
                  <option value="">Select House</option>
                  {houses.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.number}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Tenant + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">Tenant Name</label>
                <input
                  type="text"
                  value={form.tenantName}
                  readOnly
                  className="w-full border px-3 py-2 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md"
                />
              </div>
            </div>

            {/* Row 3: Issue + Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium">Issue</label>
                <textarea
                  name="issue"
                  value={form.issue}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md"
                  rows="3"
                ></textarea>
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium">Cost (QR)</label>
                <input
                  type="number"
                  name="cost"
                  value={form.cost}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
              >
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
