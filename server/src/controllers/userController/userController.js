import { TenantProfile } from "../../models/TenantProfile.js";
import { House } from "../../models/House.js";
import { Villa } from "../../models/Villa.js";
import { Rental } from "../../models/Rental.js";
import { MaintenanceRequest } from "../../models/MaintenanceRequest.js";

// GET /api/user/rentals
export const getUserRentals = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware

    // tenant profile
    const profile = await TenantProfile.findOne({ userId }).populate({
      path: "assignedHouseId",
      populate: { path: "villaId", model: "Villa" },
    });

    if (!profile) {
      return res.status(404).json({ message: "Tenant profile not found" });
    }

    const house = profile.assignedHouseId;
    const villa = house?.villaId;

    // rental history
    const history = await Rental.find({ tenantUserId: userId })
      .sort({ year: -1, month: -1 })
      .lean();
     
    // maintenance requests (linked to house)
    const maintenance = await MaintenanceRequest.find({ houseId: house?._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      user: {
        name: req.user.name,
        qatarId: profile.qatarId,
        contact: profile.contact,
        villaName: villa?.name,
        houseNumber: house?.number,
        rent: house?.rentAmount,
      },
      history,
      maintenance,
    });
  } catch (err) {
    console.error("Error in getUserRentals:", err);
    res.status(500).json({ message: "Failed to fetch rentals" });
  }
};


// POST /api/user/maintenance
export const createMaintenance = async (req, res) => {
    try {
      const userId = req.user._id;
      const { issue } = req.body;
  
      const profile = await TenantProfile.findOne({ userId }).populate("assignedHouseId");
      if (!profile || !profile.assignedHouseId) {
        return res.status(400).json({ message: "No assigned house found" });
      }
  
      const house = profile.assignedHouseId;
  
      const newReq = new MaintenanceRequest({
        villaId: house.villaId,
        houseId: house._id,
        tenantName: req.user.name,
        date: new Date(),
        issue,
        status: "Pending",
        cost: 0,
      });
  
      await newReq.save();
      res.status(201).json(newReq);
    } catch (err) {
      console.error("Error in createMaintenance:", err);
      res.status(500).json({ message: "Failed to create maintenance request" });
    }
  };
  