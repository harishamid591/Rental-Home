// routes/rentalRoutes.js
import express from "express";
import { getRentals, toggleRentalStatus } from "../controllers/adminController/rentalController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/",protect, adminOnly, getRentals);
router.put("/:rentalId/toggle", protect, adminOnly, toggleRentalStatus);


export default router;
