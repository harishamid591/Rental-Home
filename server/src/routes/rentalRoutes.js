// routes/rentalRoutes.js
import express from "express";
import { getRentals, toggleRentalStatus } from "../controllers/adminController/rentalController.js";

const router = express.Router();

router.get("/", getRentals);
router.put("/:rentalId/toggle", toggleRentalStatus);


export default router;
