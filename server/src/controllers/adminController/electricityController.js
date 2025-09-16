import { Electricity } from "../../models/Electricity.js";
import { Villa } from "../../models/Villa.js";

// Create
export const createElectricity = async (req, res) => {
  try {
    const { villaId, amount, date } = req.body;

    if (!villaId || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const villa = await Villa.findById(villaId);
    if (!villa) return res.status(404).json({ message: "Villa not found" });

    const electricity = new Electricity({ villaId, amount, date });
    await electricity.save();

    res.status(201).json({
      _id: electricity._id,
      villaName: villa.name,
      villaId: villa._id,
      amount: electricity.amount,
      date: electricity.date,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Read (with month filter)
export const getElectricities = async (req, res) => {
  try {
    const { month } = req.query; // e.g. "2025-09"
    let filter = {};

    if (month) {
      const [year, mon] = month.split("-");
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 0);
      filter.date = { $gte: start, $lte: end };
    }

    const electricities = await Electricity.find(filter)
      .populate("villaId", "name")
      .sort({ date: -1 });

    const result = electricities.map((e) => ({
      _id: e._id,
      villaName: e.villaId?.name || "-",
      villaId: e.villaId?._id || null,
      amount: e.amount,
      date: e.date,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update
export const updateElectricity = async (req, res) => {
  try {
    const { id } = req.params;
    const { villaId, amount, date } = req.body;

    const updated = await Electricity.findByIdAndUpdate(
      id,
      { villaId, amount, date },
      { new: true }
    ).populate("villaId", "name");

    if (!updated) return res.status(404).json({ message: "Electricity not found" });

    res.json({
      _id: updated._id,
      villaName: updated.villaId?.name || "-",
      villaId: updated.villaId?._id || null,
      amount: updated.amount,
      date: updated.date,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete
export const deleteElectricity = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Electricity.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Electricity not found" });
    res.json({ message: "Electricity deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
