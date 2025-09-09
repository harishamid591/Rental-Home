import express from "express";
import { createVilla, getVillas } from "../controllers/villaController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Only admin can create villas
router.post("/", protect, adminOnly, createVilla);

// ✅ Tenants & admins can view villas
router.get("/", protect, getVillas);

export default router;
