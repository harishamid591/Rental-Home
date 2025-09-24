// controllers/rentalController.js
import Joi from "joi";
import { Rental } from "../../models/Rental.js";
import { House } from "../../models/House.js";


const getRentalsSchema = Joi.object({
  villaId: Joi.string().required(),
  status: Joi.string().valid("all", "paid", "unpaid").default("all"),
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
});


export const getRentals = async (req, res) => {
    try {

      console.log('heyyy')

      const { error, value } = getRentalsSchema.validate(req.query);
      if (error) return res.status(400).json({ success: false, message: error.message });

      const { villaId, status, month } = value;
      const [yearStr, monthStr] = month.split("-");
      const year = Number(yearStr);
      const monthNum = Number(monthStr);;
  
      // ✅ Step 1: Find all houses under this villa
      const houses = await House.find({ villaId, isDeleted: { $ne: true } }).populate("currentTenantUserId", "name isDeleted");
  
      const existingRentals = await Rental.find({ villaId, month: monthNum, year }).lean();

      const existingKeys = new Set(existingRentals.map(r => `${String(r.houseId)}_${String(r.tenantUserId)}`));

      // ✅ Step 2: Ensure rental record exists for each active tenant-house
      const bulkOps = [];
      for (const house of houses) {
        const tenant = house.currentTenantUserId;
        if (tenant && !tenant.isDeleted) {
          const key = `${String(house._id)}_${String(tenant._id)}`;
          if (!existingKeys.has(key)) {
            const newDoc = {
              villaId,
              houseId: house._id,
              tenantUserId: tenant._id,
              rentAmount: house.rentAmount,
              status: "unpaid",
              month: monthNum,
              year,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            bulkOps.push({ insertOne: { document: newDoc } });
            existingKeys.add(key);
          }
        }
      }
  
      if (bulkOps.length > 0) {
        await Rental.bulkWrite(bulkOps);
      }
  
      // ✅ Step 3: Fetch rentals for active tenants only
      const fetchFilter = { villaId, month: monthNum, year };
      if (status && status !== "all") fetchFilter.status = status;
  
      const rentals = await Rental.find(fetchFilter)
      .populate("tenantUserId", "name email isDeleted")
      .populate("villaId", "name")
      .populate("houseId", "number rentAmount")
      .lean();
  
      // ✅ Step 4: Filter out rentals with deleted tenants and format safely
      const formatted = rentals
      .filter(r => r.tenantUserId && !r.tenantUserId.isDeleted)
      .map(r => ({
        rentalId: r._id,
        tenantId: r.tenantUserId._id,
        tenantName: r.tenantUserId.name,
        villaName: r.villaId?.name || "-",
        houseNumber: r.houseId?.number || "-",
        rentAmount: r.rentAmount,
        status: r.status,
        month: r.month,
        year: r.year,
        paidDate: r.paidDate || null,
      }));

      return res.json(formatted);
    } catch (err) {
      console.error("getRentals error:", err);
      res.status(500).json({ message: "Failed to fetch rentals" });
    }
  };
  

// Toggle rental paid/unpaid
export const toggleRentalStatus = async (req, res) => {
  try {
    const { rentalId } = req.params;

    const rental = await Rental.findById(rentalId);

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    // Flip status
    if (rental.status === "unpaid") {
      rental.status = "paid";
      rental.paidDate = new Date(); // ✅ set current date when marked paid
    } else {
      rental.status = "unpaid";
      rental.paidDate = null; // ✅ clear date when reverting back
    }

    await rental.save();

    return res.json({
      message: `Rental marked as ${rental.status}`,
      rental: {
        rentalId: rental._id,
        tenantId: rental.tenantUserId,
        status: rental.status,
        paidDate: rental.paidDate,
      },
    });
  } catch (err) {
    console.error("toggleRentalStatus error:", err);
    res.status(500).json({ message: "Failed to update rental status" });
  }
};

