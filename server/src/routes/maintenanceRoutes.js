// routes/maintenanceRoutes.js
import express from "express";
import { createMaintenance, getMaintenances, updateMaintenance, deleteMaintenance } from "../controllers/adminController/maintenanceController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",protect,adminOnly, createMaintenance);
router.get("/",protect,adminOnly, getMaintenances);
router.put("/:id",protect,adminOnly, updateMaintenance);
router.delete("/:id",protect,adminOnly, deleteMaintenance);


export default router;
