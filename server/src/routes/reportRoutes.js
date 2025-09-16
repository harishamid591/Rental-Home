// backend/routes/reportRoutes.js
import express from "express";
import { getReport, exportReportPdf } from "../controllers/adminController/reportController.js";

const router = express.Router();

router.get("/", getReport);
router.get("/export", exportReportPdf);



export default router;
