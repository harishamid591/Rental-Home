import { Villa } from "../models/Villa.js";

// POST /api/villas
export const createVilla = async (req, res) => {
  try {
    const { name, address } = req.body;
    const villa = await Villa.create({ name, address });
    res.status(201).json(villa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/villas
export const getVillas = async (req, res) => {
  try {
    const villas = await Villa.find();
    res.json(villas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
