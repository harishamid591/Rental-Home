import express from "express";
import { getDashboard, getYearlyFinancials } from "../controllers/adminController/dashboardController.js";


const router = express.Router();

// GET /api/admin/dashboard
router.get("/", getDashboard);
router.get("/yearly-financials", getYearlyFinancials);

export default router;
