import express from "express";
import { getUserRentals, createMaintenance } from "../../controllers/userController/userController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/rentals", protect, getUserRentals);
router.post("/maintenance", protect, createMaintenance);

export default router;
