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
  const [villas, houses] = await Promise.all([
    villaId
      ? Villa.find({ _id: villaId, isDeleted: { $ne: true } })
      : Villa.find({ isDeleted: { $ne: true } }),
    House.find(villaId ? { villaId, isDeleted: { $ne: true } } : { isDeleted: { $ne: true } }),
  ]);

  const totalVillas = villas.length;
  const totalHouses = houses.length;
  const occupiedHouses = houses.filter((h) => h.isOccupied).length;
  const availableHouses = totalHouses - occupiedHouses;

  // Tenants
  const totalTenants = await User.countDocuments({ role: "tenant", isDeleted: false });

  const [rentals, electricityRecords, maintenanceRecords] = await Promise.all([
    Rental.find({
      ...(villaId && { villaId }),
      month,
      year,
      status: "paid",
    }),
    Electricity.find({
      ...(villaId && { villaId }),
      date: { $gte: startDate, $lt: endDate },
    }),
    MaintenanceRequest.find({
      ...(villaId && { villaId }),
      date: { $gte: startDate, $lt: endDate },
    }),
  ]);

  const monthlyRentCollected = rentals.reduce((sum, r) => sum + (r.rentAmount || 0), 0);
  const totalOwnerRent = villas.reduce((sum, v) => sum + (v.price || 0), 0);
  const monthlyElectricity = electricityRecords.reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyMaintenance = maintenanceRecords.reduce((sum, m) => sum + (m.cost || 0), 0);
  const monthlyProfit = monthlyRentCollected - (totalOwnerRent + monthlyElectricity + monthlyMaintenance);

  // Map villaId → data for performance
  const houseMap = new Map();
  houses.forEach((h) => {
    const vId = h.villaId.toString();
    if (!houseMap.has(vId)) houseMap.set(vId, []);
    houseMap.get(vId).push(h);
  });

  const rentalMap = new Map();
  rentals.forEach((r) => {
    const vId = r.villaId.toString();
    if (!rentalMap.has(vId)) rentalMap.set(vId, []);
    rentalMap.get(vId).push(r);
  });

  const electricityMap = new Map();
  electricityRecords.forEach((e) => {
    const vId = e.villaId.toString();
    if (!electricityMap.has(vId)) electricityMap.set(vId, []);
    electricityMap.get(vId).push(e);
  });

  const maintenanceMap = new Map();
  maintenanceRecords.forEach((m) => {
    const vId = m.villaId.toString();
    if (!maintenanceMap.has(vId)) maintenanceMap.set(vId, []);
    maintenanceMap.get(vId).push(m);
  });

  // Villa-wise report
  const reportData = villas.map((villa) => {
    const vId = villa._id.toString();
    const villaHouses = houseMap.get(vId) || [];
    const villaRentals = rentalMap.get(vId) || [];
    const villaElectricity = (electricityMap.get(vId) || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const villaMaintenance = (maintenanceMap.get(vId) || []).reduce((sum, m) => sum + (m.cost || 0), 0);
    const villaOwnerRent = villa.price || 0;
    const villaIncome = villaRentals.reduce((sum, r) => sum + (r.rentAmount || 0), 0);
    const villaProfit = villaIncome - (villaOwnerRent + villaElectricity + villaMaintenance);

    return {
      villaName: villa.name,
      income: villaIncome,
      ownerRent: villaOwnerRent,
      electricity: villaElectricity,
      maintenance: villaMaintenance,
      profit: villaProfit,
    };
  });

  // Totals
  const totals = {
    income: reportData.reduce((sum, v) => sum + v.income, 0),
    ownerRent: villas.reduce((sum, v) => sum + (v.price || 0), 0), // ✅ direct from villas
    electricity: reportData.reduce((sum, v) => sum + v.electricity, 0),
    maintenance: reportData.reduce((sum, v) => sum + v.maintenance, 0),
    profit: reportData.reduce((sum, v) => sum + v.profit, 0),
  };

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


