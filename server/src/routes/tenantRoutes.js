import express from "express";
import { createTenant, deleteTenant, getTenants, updateTenantProfile } from "../controllers/adminController/tenantController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";



const router = express.Router()

// Admin endpoints
router.post("/createTenant",protect,adminOnly, createTenant);
router.delete("/deleteTenant/:id",protect,adminOnly, deleteTenant);
router.get("/tenants",protect, adminOnly, getTenants);
router.put("/tenants/:id",protect,adminOnly,updateTenantProfile)



export default router