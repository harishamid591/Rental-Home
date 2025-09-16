import Joi from "joi";
import { Villa } from "../models/Villa.js";


// Validation schemas
const addVillaSchema = Joi.object({
  name: Joi.string().trim().required(),
  location: Joi.string().trim().required(),
  price: Joi.number().min(0).required(),
});

// Get all villas
export const getVillas = async (req, res) => {
  try {
    const villas = await Villa.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }); // newest first

    return res.json(villas);
  } catch (err) {
    console.error("Get Villas Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add new villa
export const addVilla = async (req, res) => {
  try {
    const { error, value } = addVillaSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const villa = new Villa(value);
    await villa.save();
    return res.status(201).json(villa);
  } catch (err) {
    console.error("Add Villa Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Delete villa
export const deleteVilla = async (req, res) => {
  try {
    const { id } = req.params;
    const villa = await Villa.findById(id);

    if (!villa || villa.isDeleted) {
      return res.status(404).json({ success: false, message: "Villa not found" });
    }

    villa.isDeleted = true;
    await villa.save();

    res.json({ message: "Villa deleted successfully" });
  } catch (err) {
    console.error("Delete Villa Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateVillaSchema = Joi.object({
  name: Joi.string().trim().optional(),
  location: Joi.string().trim().optional(),
  price: Joi.number().min(0).optional(),
});

// Update villa
export const updateVilla = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateVillaSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const villa = await Villa.findByIdAndUpdate(id, value, { new: true, runValidators: true });
    if (!villa) return res.status(404).json({ success: false, message: "Villa not found" });

  
    res.json({ message: "Villa updated successfully",villa});
  } catch (err) {
    console.error("Update Villa Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


