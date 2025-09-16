import express from "express";
import {
  createElectricity,
  getElectricities,
  updateElectricity,
  deleteElectricity,
} from "../controllers/adminController/electricityController.js";

const router = express.Router();

router.post("/", createElectricity);
router.get("/", getElectricities);
router.put("/:id", updateElectricity);
router.delete("/:id", deleteElectricity);

export default router;
