import express from "express";
import { getDashboard, getYearlyFinancials } from "../controllers/adminController/dashboardController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/admin/dashboard
router.get("/",protect,adminOnly, getDashboard);
router.get("/yearly-financials",protect,adminOnly, getYearlyFinancials);

export default router;
