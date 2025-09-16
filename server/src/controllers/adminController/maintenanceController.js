// controllers/maintenanceController.js
import Joi from "joi";
import { MaintenanceRequest } from "../../models/MaintenanceRequest.js";
import { Villa } from "../../models/Villa.js";
import { House } from "../../models/House.js";


const createSchema = Joi.object({
  villaId: Joi.string().required(),
  houseId: Joi.string().required(),
  tenantName: Joi.string().optional().allow(""),
  date: Joi.date().optional(),
  issue: Joi.string().required(),
  cost: Joi.number().min(0).required(),
});

// 🔹 Helper to format maintenance consistently
const formatMaintenance = (m) => ({
  _id: m._id,
  villaId: m.villaId?._id || m.villaId || null,
  villaName: m.villaId?.name || m.villaName || "-",
  houseId: m.houseId?._id || m.houseId || null,
  houseNumber: m.houseId?.number || m.houseNumber || "-",
  tenantName: m.tenantName || m.houseId?.currentTenantUserId?.name || "-",
  date: m.date,
  issue: m.issue,
  cost: m.cost,
});

// 🔹 Add new maintenance
export const createMaintenance = async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const { villaId, houseId, tenantName, date, issue, cost } = value;

    const villa = await Villa.findById(villaId);
    const house = await House.findById(houseId).populate("currentTenantUserId", "name");

    if (!villa || villa.isDeleted) return res.status(400).json({ success: false, message: "Invalid villa" });
    if (!house || house.isDeleted) return res.status(400).json({ success: false, message: "Invalid house" });

    const resolvedTenantName = tenantName || house.currentTenantUserId?.name || "";

    const maintenance = new MaintenanceRequest({
      villaId,
      houseId,
      tenantName: resolvedTenantName,
      date: date || new Date(),
      issue,
      cost,
    });

    const saved = await maintenance.save();

    // repopulate to keep same shape
    const populated = await MaintenanceRequest.findById(saved._id)
      .populate("villaId", "name")
      .populate("houseId", "number currentTenantUserId");

    return res.status(201).json(formatMaintenance(populated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Get maintenances (with optional month filter)
export const getMaintenances = async (req, res) => {
  try {
    const { month } = req.query; // e.g. "2025-09"
    let filter = {};

    if (month) {
      const [year, mon] = month.split("-");
      const start = new Date(Number(year), Number(mon) - 1, 1);
      const end = new Date(Number(year), Number(mon), 0, 23, 59, 59, 99);
      filter.date = { $gte: start, $lte: end };
    }

    const maintenances = await MaintenanceRequest.find(filter)
      .populate("villaId", "name")
      .populate("houseId", "number currentTenantUserId")
      .sort({ date: -1 });

    return res.json(maintenances.map(formatMaintenance));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Update maintenance
export const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await MaintenanceRequest.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate("villaId", "name")
      .populate("houseId", "number currentTenantUserId");

    if (!updated) {
      return res.status(404).json({ message: "Maintenance not found" });
    }

    res.json(formatMaintenance(updated));
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔹 Delete maintenance
export const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MaintenanceRequest.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Maintenance not found" });
    res.json({ message: "Maintenance deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
