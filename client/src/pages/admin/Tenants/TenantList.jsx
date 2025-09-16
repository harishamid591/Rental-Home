// src/pages/admin/Tenants/TenantList.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URI } from "../../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import {
  setTenants,
  addTenant,
  updateTenant,
  deleteTenant,
} from "../../../features/slice/tenantSlice";
import Loader from "../../../components/Loaders";
import Swal from "sweetalert2";

const TenantList = () => {
  const dispatch = useDispatch();
  const tenants = useSelector((state) => state.tenants.list);

  const [selectedVilla, setSelectedVilla] = useState("all");
  const [houses, setHouses] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    qatarId: "",
    contact: "",
    role: "tenant",
    assignedHouseId: "",
    startDate: "", 
  });

  const [editFormData, setEditFormData] = useState({
    qatarId: "",
    contact: "",
  });

  const [currentTenantId, setCurrentTenantId] = useState(null);

  

  // Fetch tenants
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await axios.get(API_URI + "/api/tenantProfiles/tenants", {
          withCredentials: true,
        });

        dispatch(setTenants(res.data));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch tenants");
      }finally{
        setPageLoading(false)
      }
    };
    fetchTenants();
  }, [dispatch]);

  

  // Fetch houses
  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await axios.get(API_URI + "/api/houses", {
          withCredentials: true,
        });
        setHouses(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch houses");
      }
    };
    fetchHouses();
  }, []);

 

  // Add tenant
  const handleAddTenant = async () => {
    if (!formData.name || !formData.contact || !formData.qatarId || !formData.startDate) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        API_URI + "/api/tenantProfiles/createTenant",
        formData,
        { withCredentials: true }
      );


      dispatch(addTenant(res.data));

      toast.success("Tenant account created successfully ✅");

      setFormData({
        name: "",
        contact: "",
        role: "tenant",
        qatarId: "",
        assignedHouseId: "",
        startDate: "",
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create tenant");
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (tenant) => {
    const { profile } = tenant;
    setCurrentTenantId(tenant._id);
    setEditFormData({
      qatarId: profile?.qatarId || "",
      contact: profile?.contact || "",
    });
    setIsEditModalOpen(true);
  };

  // Update tenant profile
  const handleUpdateTenantProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.put(
        API_URI + `/api/tenantProfiles/tenants/${currentTenantId}`,
        { ...editFormData },
        { withCredentials: true }
      );

      dispatch(updateTenant(res.data));

      toast.success("Tenant profile updated successfully ✨");
      setIsEditModalOpen(false);
      setCurrentTenantId(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Delete tenant

  const handleDeleteTenant = async (tenantId) => {
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
          await axios.delete(API_URI + `/api/tenantProfiles/deleteTenant/${tenantId}`, {
            withCredentials: true,
          });
    
          dispatch(deleteTenant(tenantId));
          toast.success("Tenant deleted successfully 🗑️");
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete tenant");
        }
      }
    });
  };

  const availableHouses = houses.filter((house) => !house.currentTenantUserId);

  const filteredTenants = tenants.filter((tenant) => {
    const villaName = tenant.profile?.assignedHouseId?.villaId?.name;
    if (selectedVilla === "all") return true;
    return villaName === selectedVilla;
  });

  const villaOptions = [
    ...new Set(
      tenants
        .map((t) => t.profile?.assignedHouseId?.villaId?.name)
        .filter(Boolean)
    ),
  ];


  if(pageLoading){
    return <Loader/>
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header with filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tenants</h1>
        <div className="flex gap-3">
          <select
            value={selectedVilla}
            onChange={(e) => setSelectedVilla(e.target.value)}
            className="border px-3 py-2 cursor-pointer rounded-md"
          >
            <option value="all">All Villas</option>
            {villaOptions.map((villa, idx) => (
              <option key={idx} value={villa}>
                {villa}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer px-4 py-2 rounded-lg shadow transition duration-200"
          >
            + Add Tenant
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-800 text-white text-sm sm:text-base">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Qatar ID</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Villa</th>
              <th className="px-4 py-3 text-left">House</th>
              <th className="px-4 py-3 text-left">Rent</th>
              <th className="px-4 py-3 text-left">Start Date</th> {/* ✅ new col */}
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">No tenants found</td>
              </tr>
            ) : (
              filteredTenants.map((tenant) => {

                const profile = tenant.profile || {};
                const house = profile.assignedHouseId || {};
                const villa = house.villaId || {};

                return (
                  <tr key={tenant._id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{tenant.name}</td>
                    <td className="px-4 py-3">{profile.qatarId || "-"}</td>
                    <td className="px-4 py-3">{profile.contact || "-"}</td>
                    <td className="px-4 py-3">{villa.name || "-"}</td>
                    <td className="px-4 py-3">{house.number || "-"}</td>
                    <td className="px-4 py-3">{house.rentAmount ? `QR ${house.rentAmount}` : "-"}</td>
                    <td className="px-4 py-3">{profile.startDate ? new Date(profile.startDate).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => openEditModal(tenant)}
                        className="bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200 px-3 py-1 rounded-md text-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTenant(tenant._id)}
                        className="bg-red-100 text-red-700 cursor-pointer hover:bg-red-200 px-3 py-1 rounded-md text-sm transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Tenant Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={(e) => e.target === e.currentTarget && setIsAddModalOpen(false)}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Tenant</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              />
              <input
                type="number"
                placeholder="Qatar Id"
                value={formData.qatarId}
                onChange={(e) => setFormData({ ...formData, qatarId: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              />
              <input
                type="number"
                placeholder="Contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              />

              {/* Start Date input */}
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              />

              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              >
                <option value="tenant">Tenant</option>
                <option value="admin">Admin</option>
              </select>

              {/* House dropdown */}
              <select
                value={formData.assignedHouseId}
                onChange={(e) =>
                  setFormData({ ...formData, assignedHouseId: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
              >
                <option value="">Select House (optional)</option>
                {availableHouses.map((house) => (
                  <option key={house._id} value={house._id}>
                    {house.number} ({house.villaId?.name}) – Rent QR {house.rentAmount}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTenant}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={(e) => e.target === e.currentTarget && setIsEditModalOpen(false)}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Tenant Profile</h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="qatarId" className="block mb-1 font-medium text-gray-700">
                  Qatar ID
                </label>
                <input
                  id="qatarId"
                  type="text"
                  placeholder="Qatar ID"
                  value={editFormData.qatarId}
                  onChange={(e) => setEditFormData({ ...editFormData, qatarId: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="contact" className="block mb-1 font-medium text-gray-700">
                  Contact
                </label>
                <input
                  id="contact"
                  type="text"
                  placeholder="Contact"
                  value={editFormData.contact}
                  onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTenantProfile}
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

export default TenantList;
