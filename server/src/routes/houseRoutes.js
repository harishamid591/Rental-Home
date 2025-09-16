import express from "express";
import  {
    getHouses,
    createHouses,
    updateHouse,
    deleteHouse,
  }from "../controllers/adminController/houseController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",protect,adminOnly, getHouses);
router.post("/",protect,adminOnly, createHouses);

router.put("/:id",protect,adminOnly, updateHouse);
router.delete("/:id", deleteHouse);



export default router;