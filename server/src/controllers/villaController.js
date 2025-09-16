import { Villa } from "../models/Villa.js";


// Get all villas
export const getVillas = async (req, res) => {
  try {
    const villas = await Villa.find().sort({ createdAt: -1 }); // newest first

    res.json(villas);
  } catch (err) {
    console.error("Get Villas Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add new villa
export const addVilla = async (req, res) => {
  try {

    const { name, location, price } = req.body;

    if (!name || !location || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const villa = new Villa({ name, location, price });
    await villa.save();

    res.status(201).json(villa);
  } catch (err) {
    console.error("Add Villa Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Delete villa
export const deleteVilla = async (req, res) => {
  try {
    const { id } = req.params;
    const villa = await Villa.findByIdAndDelete(id);

    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }

    res.json({ message: "Villa deleted successfully" });
  } catch (err) {
    console.error("Delete Villa Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Update villa
export const updateVilla = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, price } = req.body;

    const villa = await Villa.findByIdAndUpdate(
      id,
      { name, location, price },
      { new: true, runValidators: true }
    );

    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }

    res.json({ message: "Villa updated successfully",villa});
  } catch (err) {
    console.error("Update Villa Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


