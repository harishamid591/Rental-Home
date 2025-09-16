// routes/maintenanceRoutes.js
import express from "express";
import { createMaintenance, getMaintenances, updateMaintenance, deleteMaintenance } from "../controllers/adminController/maintenanceController.js";

const router = express.Router();

router.post("/", createMaintenance);
router.get("/", getMaintenances);
router.put("/:id", updateMaintenance);
router.delete("/:id", deleteMaintenance);


export default router;
