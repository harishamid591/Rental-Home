
import express from "express";
import { getReport, exportReportPdf } from "../controllers/adminController/reportController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/",protect,adminOnly, getReport);
router.get("/export",protect,adminOnly, exportReportPdf);



export default router;
