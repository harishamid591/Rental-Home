// controllers/rentalController.js
import { Rental } from "../../models/Rental.js";
import { House } from "../../models/House.js";




export const getRentals = async (req, res) => {
    try {
      const { villaId, status, month } = req.query;
  
      if (!villaId || !month) {
        return res.status(400).json({ message: "villaId & month are required" });
      }
  
      // Parse "YYYY-MM"
      const [yearStr, monthStr] = month.split("-");
      const year = parseInt(yearStr);
      const monthNum = parseInt(monthStr);
  
      if (isNaN(year) || isNaN(monthNum)) {
        return res.status(400).json({ message: "Invalid month format, use YYYY-MM" });
      }
  
      // ✅ Step 1: Find all houses under this villa
      const houses = await House.find({ villaId }).populate("currentTenantUserId");
  
      // ✅ Step 2: Ensure rental record exists for each active tenant-house
      for (const house of houses) {
        const tenant = house.currentTenantUserId;
        if (tenant && !tenant.isDeleted) { // Only active tenants
          const exists = await Rental.findOne({
            villaId,
            houseId: house._id,
            tenantUserId: tenant._id,
            month: monthNum,
            year,
          });
  
          if (!exists) {
            await Rental.create({
              villaId,
              houseId: house._id,
              tenantUserId: tenant._id,
              rentAmount: house.rentAmount,
              status: "unpaid",
              month: monthNum,
              year,
            });
          }
        }
      }
  
      // ✅ Step 3: Fetch rentals for active tenants only
      const filter = { villaId, month: monthNum, year };
      if (status && status !== "all") filter.status = status;
  
      const rentals = await Rental.find(filter)
        .populate("tenantUserId", "name email isDeleted") // include deleted flag
        .populate("villaId", "name")
        .populate("houseId", "number rentAmount");
  
      // ✅ Step 4: Filter out rentals with deleted tenants and format safely
      const formatted = rentals
        .filter(r => r.tenantUserId && !r.tenantUserId.isDeleted) // only active tenants
        .map((r) => ({
          rentalId: r._id,
          tenantId: r.tenantUserId._id,
          tenantName: r.tenantUserId.name,
          villaName: r.villaId.name,
          houseNumber: r.houseId.number,
          rentAmount: r.rentAmount,
          status: r.status,
          month: r.month,
          year: r.year,
          paidDate: r.paidDate || null,
        }));
  
      res.json(formatted);
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
    console.log(rental)
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

    res.json({
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

