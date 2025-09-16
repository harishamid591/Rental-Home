// backend/helpers/dashboardHelper.js
import { Villa } from "../models/Villa.js";
import { House } from "../models/House.js";
import { User } from "../models/User.js";
import { Rental } from "../models/Rental.js";
import { Electricity } from "../models/Electricity.js";
import { MaintenanceRequest } from "../models/MaintenanceRequest.js";

export const getMonthlyAggregates = async (month, year, villaId = null) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // Villas
  const villas = villaId ? await Villa.find({ _id: villaId }) : await Villa.find();
  const totalVillas = villas.length;

  // Houses
  const houses = await House.find(villaId ? { villaId } : {});
  const totalHouses = houses.length;
  const occupiedHouses = houses.filter((h) => h.isOccupied).length;
  const availableHouses = totalHouses - occupiedHouses;

  // Tenants
  const totalTenants = await User.countDocuments({ role: "tenant", isDeleted: false });

  // Rentals
  const rentals = await Rental.find({
    ...(villaId && { villaId }),
    month,
    year,
    status: "paid",
  });
  const monthlyRentCollected = rentals.reduce((sum, r) => sum + (r.rentAmount || 0), 0);

  // Owner rent (houses)
  const totalOwnerRent = houses.reduce((sum, h) => sum + (h.rentAmount || 0), 0);

  // Electricity
  const electricityRecords = await Electricity.find({
    ...(villaId && { villaId }),
    date: { $gte: startDate, $lt: endDate },
  });
  const monthlyElectricity = electricityRecords.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Maintenance
  const maintenanceRecords = await MaintenanceRequest.find({
    ...(villaId && { villaId }),
    date: { $gte: startDate, $lt: endDate },
  });
  const monthlyMaintenance = maintenanceRecords.reduce((sum, m) => sum + (m.cost || 0), 0);

  // Profit
  const monthlyProfit = monthlyRentCollected - (totalOwnerRent + monthlyElectricity + monthlyMaintenance);

  // For report data (villa-wise)
  const reportData = villas.map((villa) => {
    const villaHouses = houses.filter((h) => h.villaId.toString() === villa._id.toString());
    const villaRentals = rentals.filter((r) => r.villaId.toString() === villa._id.toString());
    const villaElectricity = electricityRecords
      .filter((e) => e.villaId.toString() === villa._id.toString())
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const villaMaintenance = maintenanceRecords
      .filter((m) => m.villaId.toString() === villa._id.toString())
      .reduce((sum, m) => sum + (m.cost || 0), 0);
    const villaOwnerRent = villaHouses.reduce((sum, h) => sum + (h.rentAmount || 0), 0);
    const villaProfit = villaRentals.reduce((sum, r) => sum + (r.rentAmount || 0), 0) - (villaOwnerRent + villaElectricity + villaMaintenance);

    return {
      villaName: villa.name,
      income: villaRentals.reduce((sum, r) => sum + (r.rentAmount || 0), 0),
      ownerRent: villaOwnerRent,
      electricity: villaElectricity,
      maintenance: villaMaintenance,
      profit: villaProfit,
    };
  });

  // Totals
  const totals = reportData.reduce(
    (acc, r) => {
      acc.income += r.income;
      acc.ownerRent += r.ownerRent;
      acc.electricity += r.electricity;
      acc.maintenance += r.maintenance;
      acc.profit += r.profit;
      return acc;
    },
    { income: 0, ownerRent: 0, electricity: 0, maintenance: 0, profit: 0 }
  );

  return {
    summary: {
      totalVillas,
      totalHouses,
      occupiedHouses,
      availableHouses,
      totalTenants,
      monthlyRentCollected,
      monthlyElectricity,
      monthlyMaintenance,
      monthlyProfit,
    },
    reportData,
    totals,
  };
};


