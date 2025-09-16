// src/pages/admin/Villas/VillaList.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URI } from "../../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { setVillaLoading, setVillas, addVilla, updateVilla, deleteVilla, setError } from "../../../features/slice/villaSlice";
import Loader from "../../../components/Loaders";
import Swal from "sweetalert2";


const VillaList = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", location: "", price: "" });
  const [loading, setLoading] = useState(false);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", location: "", price: "" });
  const [currentVillaId, setCurrentVillaId] = useState(null);

  const { items: villas, villaLoading, error } = useSelector((state) => state.villas);
  const dispatch = useDispatch()

  // Fetch villas on page load
  useEffect(() => {
    const fetchVillas = async () => {
      try {
        dispatch(setVillaLoading(true));
        
        const res = await axios.get(API_URI+"/api/villas", { withCredentials: true });

        // Check if API returns { data: [...] } or just [...]
        const villaData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
  
        dispatch(setVillas(villaData));

      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch villas");
        dispatch(setError("Failed to load villas"));
      } finally {
        dispatch(setVillaLoading(false));
      }
    };
    fetchVillas();
  }, [dispatch]);

  if (villaLoading) {
    return <Loader />; 
  }


  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // Add villa API call
  const handleAddVilla = async () => {
    if (!formData.name || !formData.location || !formData.price) {
      toast.error("Please fill all fields!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        API_URI+"/api/villas/add",
        { ...formData, price: Number(formData.price) },
        { withCredentials: true }
      );

      dispatch(addVilla(res.data));

      toast.success("Villa added successfully 🏡");

      setFormData({ name: "", location: "", price: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add villa");
    } finally {
      setLoading(false);
    }
  };

  // Delete villa API call
  const handleDeleteVilla = async (id) => {
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
          await axios.delete(API_URI + `/api/villas/${id}`, { withCredentials: true });
          dispatch(deleteVilla(id));

          toast.success("Villa deleted successfully ✨");
  
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Failed to delete villa", "error");
        }
      }
    });
  };

  // Open edit modal with villa data
  const openEditModal = (villa) => {
    setCurrentVillaId(villa._id);
    setEditFormData({ name: villa.name, location: villa.location, price: villa.price });
    setIsEditModalOpen(true);
  };

  // Update villa API call
  const handleUpdateVilla = async () => {
    if (!editFormData.name || !editFormData.location || !editFormData.price) {
      toast.error("Please fill all fields!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
        API_URI+`/api/villas/${currentVillaId}`,
        { ...editFormData, price: Number(editFormData.price) },
        { withCredentials: true }
      );

      dispatch(updateVilla(res.data.villa));


      toast.success("Villa updated successfully ✨");
      setIsEditModalOpen(false);
      setCurrentVillaId(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update villa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Villas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded-lg shadow transition duration-200"
        >
          + Add Villa
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-800 text-white text-sm sm:text-base">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
      
            {villas.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No villas found
                </td>
              </tr>
            ) : (
              villas.map((villa, idx) => (
                <tr
                  key={villa._id || villa.id}
                  className={`border-t hover:bg-gray-50 transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
      
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{villa.name}</td>
                  <td className="px-4 py-3 text-gray-600">{villa.location}</td>
                  <td className="px-4 py-3 font-semibold text-gray-600">
                    QR {villa.price.toLocaleString()} 
                  </td>
                  <td className="px-4 py-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditModal(villa)}
                      className="bg-blue-100 text-blue-700 cursor-pointer w-16 text-center hover:bg-blue-200 px-3 py-1 rounded-md text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVilla(villa._id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer w-16 text-center px-3 py-1 rounded-md text-sm transition"
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

      {/* Add Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Villa</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVilla}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={(e) => e.target === e.currentTarget && setIsEditModalOpen(false)}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Villa</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="Location"
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              />
              <input
                type="number"
                placeholder="Price"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateVilla}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VillaList;
