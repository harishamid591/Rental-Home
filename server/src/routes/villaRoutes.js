import express from "express";
import { addVilla, getVillas, deleteVilla, updateVilla } from "../controllers/villaController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();



router.get("/", protect,adminOnly, getVillas);

// POST /api/villas/add (Admin only)
router.post("/add", protect, adminOnly, addVilla);

// DELETE /api/villas/:id (Admin only)
router.delete("/:id", protect, adminOnly, deleteVilla);

// PUT /api/villas/:id (Admin only)
router.put("/:id", protect, adminOnly, updateVilla);




export default router;
