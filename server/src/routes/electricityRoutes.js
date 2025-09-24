import express from "express";
import {
  createElectricity,
  getElectricities,
  updateElectricity,
  deleteElectricity,
} from "../controllers/adminController/electricityController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",protect,adminOnly, createElectricity);
router.get("/",protect,adminOnly, getElectricities);
router.put("/:id",protect,adminOnly, updateElectricity);
router.delete("/:id",protect,adminOnly, deleteElectricity);

export default router;
