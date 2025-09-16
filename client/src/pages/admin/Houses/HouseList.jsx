// src/pages/admin/Houses/HouseList.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URI } from "../../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import {
  setHouses,
  addHouse,
  updateHouse,
  deleteHouse,
} from "../../../features/slice/houseSlice";
import Loader from "../../../components/Loaders";
import Swal from "sweetalert2";


const HouseList = () => {
  const dispatch = useDispatch();
  const houses = useSelector((state) => state.houses.list);

  const [villas, setVillas] = useState([]);
  const [selectedVilla, setSelectedVilla] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    villaId: "",
    number: "",
    bedrooms: "",
    rentAmount: "",
  });
  const [loading, setLoading] = useState(false);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    villaId: "",
    number: "",
    bedrooms: "",
    rentAmount: "",
  });
  const [currentHouseId, setCurrentHouseId] = useState(null);

  // Fetch houses
  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await axios.get(API_URI + "/api/houses", {
          withCredentials: true,
        });
        const houseData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        dispatch(setHouses(houseData));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch houses");
      }
    };
    fetchHouses();
  }, [dispatch]);

  // Fetch villas
  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const res = await axios.get(API_URI + "/api/villas", {
          withCredentials: true,
        });
        setVillas(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch villas");
      }
    };
    fetchVillas();
  }, []);

  const filteredHouses =
    selectedVilla === "all"
      ? houses
      : houses.filter(
          (house) =>
            house.villaId?._id === selectedVilla || house.villaId === selectedVilla
        );

  // Add house
  const handleAddHouse = async () => {
    if (!formData.villaId || !formData.number || !formData.rentAmount) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        API_URI + "/api/houses/",
        {
          ...formData,
          bedrooms: Number(formData.bedrooms),
          rentAmount: Number(formData.rentAmount),
        },
        { withCredentials: true }
      );

      dispatch(addHouse(res.data));

      toast.success("House added successfully 🏠");

      setFormData({
        villaId: "",
        number: "",
        bedrooms: "",
        rentAmount: "",
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add house");
    } finally {
      setLoading(false);
    }
  };

  
  // Delete house

  const handleDeleteHouse = async (id) => {
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
          await axios.delete(API_URI + `/api/houses/${id}`, {
            withCredentials: true,
          });
          dispatch(deleteHouse(id));
          toast.success("House deleted successfully");
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete house");
        }
      }
    });
  };

  // Open edit modal
  
  const openEditModal = (house) => {
    setCurrentHouseId(house._id);
    setEditFormData({
      villaId: house.villaId?._id || house.villaId,
      number: house.number,
      bedrooms: house.bedrooms,
      rentAmount: house.rentAmount,
    });
    setIsEditModalOpen(true);
  };

  // Update house
  const handleUpdateHouse = async () => {
    if (!editFormData.rentAmount) {
      toast.error("Please enter rent amount!");
      return;
    }
  
    try {
      setLoading(true);
      const res = await axios.put(
        API_URI + `/api/houses/${currentHouseId}`,
        { rentAmount: Number(editFormData.rentAmount) },
        { withCredentials: true }
      );
  
      dispatch(updateHouse(res.data.house || res.data));
      toast.success("House rent updated successfully ✨");
      setIsEditModalOpen(false);
      setCurrentHouseId(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update house");
    } finally {
      setLoading(false);
    }
  };
  
  if(loading){
    return <Loader/>
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Houses</h1>
        <div className="flex flex-row gap-3">
          {/* Villa Filter */}
          <select
            value={selectedVilla}
            onChange={(e) => setSelectedVilla(e.target.value)}
            className="border px-3 py-2 rounded-md cursor-pointer"
          >
            <option value="all">All Villas</option>
            {villas.map((villa) => (
              <option key={villa._id} value={villa._id}>
                {villa.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2 rounded-lg shadow transition duration-200"
          >
            + Add House
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-800 text-white text-sm sm:text-base">
              <th className="px-4 py-3 text-left">Villa</th>
              <th className="px-4 py-3 text-left">Number</th>
              <th className="px-4 py-3 text-left">Tenant</th>
              <th className="px-4 py-3 text-left">Bedrooms</th>
              <th className="px-4 py-3 text-left">Rent Amount</th>
              <th className="px-4 py-3 text-left">Occupied</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHouses.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No houses found
                </td>
              </tr>
            ) : (
              filteredHouses.map((house) => (
                <tr key={house._id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{house.villaId?.name || "N/A"}</td>
                  <td className="px-4 py-3">{house.number}</td>
                  <td className="px-4 py-3">
                    {house.currentTenantUserId?.name || "-"}
                  </td>
                  <td className="px-4 py-3">{house.bedrooms || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-gray-600">
                    QR {house.rentAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {house.isOccupied ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => openEditModal(house)}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer px-3 py-1 rounded-md text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteHouse(house._id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer px-3 py-1 rounded-md text-sm transition"
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
            <h2 className="text-xl font-bold mb-4">Add House</h2>

            <div className="space-y-3">
              {/* Villa Select */}
              <select
                value={formData.villaId}
                onChange={(e) =>
                  setFormData({ ...formData, villaId: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
              >
                <option value="">Select Villa</option>
                {villas.map((villa) => (
                  <option key={villa._id} value={villa._id}>
                    {villa.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Number"
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
              />
              <input
                type="number"
                placeholder="Bedrooms"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
              />
              <input
                type="number"
                placeholder="Rent Amount"
                value={formData.rentAmount}
                onChange={(e) =>
                  setFormData({ ...formData, rentAmount: e.target.value })
                }
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
                onClick={handleAddHouse}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
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
          <h2 className="text-xl font-bold mb-4">Edit House Rent</h2>

          <div className="space-y-3">
            {/* Rent Amount (editable) */}
            <input
              type="number"
              placeholder="Rent Amount"
              value={editFormData.rentAmount}
              onChange={(e) =>
                setEditFormData({ ...editFormData, rentAmount: e.target.value })
              }
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
              onClick={handleUpdateHouse}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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

export default HouseList;
