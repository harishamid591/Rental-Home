import { getMonthlyAggregates } from "../../helpers/dashboardHelper.js";
import { Electricity } from "../../models/Electricity.js";
import { House } from "../../models/House.js";
import { MaintenanceRequest } from "../../models/MaintenanceRequest.js";
import { Rental } from "../../models/Rental.js";
import { Villa } from "../../models/Villa.js";

export const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const { summary } = await getMonthlyAggregates(month, year);

    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

export const getYearlyFinancials = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Map each month to a promise calling getMonthlyAggregates
    const monthPromises = months.map((month) =>
      getMonthlyAggregates(month, year).then(({ totals }) => ({
        month,
        totalRent: totals.income,
        totalExpenses: totals.ownerRent + totals.electricity + totals.maintenance + (totals.other || 0),
        totalProfit: totals.profit,
      }))
    );

    // Wait for all months in parallel
    const yearlyData = await Promise.all(monthPromises);

    res.json(yearlyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// export const getYearlyFinancials = async (req, res) => {
//   try {
//     const year = Number(req.query.year) || new Date().getFullYear();

//     // Prepare 12 months array (1 to 12)
//     const months = Array.from({ length: 12 }, (_, i) => i + 1);

//     // Fetch all houses and villas once
//     const [houses, villas] = await Promise.all([House.find(), Villa.find()]);

//     const yearlyData = [];

//     for (const month of months) {
//       // Dates for the month
//       const startDate = new Date(year, month - 1, 1);
//       const endDate = new Date(year, month, 0, 23, 59, 59, 999);

//       // Parallel fetch: rentals, electricity, maintenance
//       const [rentals, electricityRecords, maintenanceRecords] = await Promise.all([
//         Rental.find({ status: "paid", month, year }),
//         Electricity.find({ date: { $gte: startDate, $lte: endDate } }),
//         MaintenanceRequest.find({ date: { $gte: startDate, $lte: endDate } }),
//       ]);

//       // Total rent collected from tenants
//       const totalRent = rentals.reduce((sum, r) => sum + (r.rentAmount || 0), 0);

//       // Villa rent (sum of all houses in rentals)
//       const rentedHouseIds = rentals.map((r) => r.houseId.toString());
//       const housesInMonth = houses.filter((h) => rentedHouseIds.includes(h._id.toString()));

//       // Assuming each house has villaRent field representing rent paid to owner
//       const totalVillaRent = housesInMonth.reduce((sum, h) => sum + (h.villaRent || 0), 0);

//       // Total electricity and maintenance
//       const totalElectricity = electricityRecords.reduce((sum, e) => sum + (e.amount || 0), 0);
//       const totalMaintenance = maintenanceRecords.reduce((sum, m) => sum + (m.cost || 0), 0);

//       const totalExpenses = totalVillaRent + totalElectricity + totalMaintenance;
//       const totalProfit = totalRent - totalExpenses;

//       yearlyData.push({
//         month,
//         totalRent,
//         totalExpenses,
//         totalProfit,
//       });
//     }

//     res.json(yearlyData);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };