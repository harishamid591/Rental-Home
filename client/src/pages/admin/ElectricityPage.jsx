// src/pages/admin/Electricity/ElectricityPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import toast from "react-hot-toast";
import Loader from "../../components/Loaders";
import { useDispatch, useSelector } from "react-redux";
import {
  setElectricities,
  addElectricity,
  updateElectricity,
  deleteElectricity,
  setElectricityLoading,
} from "../../features/slice/electricitySlice";
import Swal from "sweetalert2";

const ElectricityPage = () => {
  const dispatch = useDispatch();
  const { items: electricities, loading } = useSelector((state) => state.electricity);

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
  const [form, setForm] = useState({
    villaId: "",
    amount: "",
    date: "",
  });

  // Fetch electricity records
  const fetchElectricities = async () => {
    dispatch(setElectricityLoading(true));
    try {
      const res = await axios.get(`${API_URI}/api/electricity?month=${month}`, {
        withCredentials: true,
      });
      dispatch(setElectricities(res.data));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load electricity records");
    } finally {
      dispatch(setElectricityLoading(false));
    }
  };

  useEffect(() => {
    fetchElectricities();
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add / Edit
  const handleSubmit = async () => {
    if (!form.villaId || !form.amount) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      if (editingId) {
        const res = await axios.put(`${API_URI}/api/electricity/${editingId}`, form, {
          withCredentials: true,
        });
        dispatch(updateElectricity(res.data));
        toast.success("Electricity record updated ✅");
      } else {
        const res = await axios.post(`${API_URI}/api/electricity`, form, {
          withCredentials: true,
        });
        dispatch(addElectricity(res.data));
        toast.success("Electricity record added ✅");
      }

      setIsModalOpen(false);
      setEditingId(null);
      setForm({ villaId: "", amount: "", date: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save electricity record");
    }
  };

  // Edit
  const handleEdit = (e) => {
    setEditingId(e._id);
    setForm({
      villaId: e.villaId || "",
      amount: e.amount,
      date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
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
          await axios.delete(`${API_URI}/api/electricity/${id}`, { withCredentials: true });
          dispatch(deleteElectricity(id));
          toast.success("Electricity record deleted ❌");
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete electricity record");
        }
      }
    });
  };



  const totalAmount = electricities.reduce((sum, e) => sum + (e.amount || 0), 0);

  if (loading) return <Loader />;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
        <h1 className="text-2xl font-bold text-gray-800">
          Electricity Records – {currentMonthLabel}
        </h1>

        <div className="flex flex-wrap gap-3">
          {/* Month filter */}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />

          <button
            onClick={() => {
              setEditingId(null);
              setForm({ villaId: "", amount: "", date: "" });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
          >
            Add Electricity
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mb-6">
        <div className="bg-blue-50 border text-center border-blue-200 rounded-lg p-4 shadow-sm">
          <p className="text-gray-600 text-sm">Total Electricity Amount</p>
          <h2 className="text-2xl font-bold text-blue-700">QR {totalAmount}</h2>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-800 text-white text-sm sm:text-base">
              <th className="px-4 py-3 text-left">Villa</th>
              <th className="px-4 py-3 text-left">Amount (QR)</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {electricities.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No electricity records found
                </td>
              </tr>
            ) : (
              electricities.map((e) => (
                <tr key={e._id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{e.villaName}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">QR {e.amount}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {e.date ? new Date(e.date).toLocaleDateString("en-GB") : "-"}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(e)}
                      className="px-3 py-1 bg-blue-500 cursor-pointer text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(e._id)}
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
              {editingId ? "Edit Electricity" : "Add Electricity"}
            </h2>

            {/* Form */}
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
                <label className="block text-sm font-medium">Amount (QR)</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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

export default ElectricityPage;
