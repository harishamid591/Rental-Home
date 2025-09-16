import Joi from "joi";
import { House } from "../../models/House.js";
import { Villa } from "../../models/Villa.js";

const createHouseSchema = Joi.object({
  villaId: Joi.string().required(),
  number: Joi.string().required(),
  bedrooms: Joi.number().integer().min(0).optional(),
  rentAmount: Joi.number().min(0).required(),
});

// controllers/houseController.js
export const getHouses = async (req, res) => {
  try {
    const { villaId } = req.query; 
    const filter = { isDeleted: { $ne: true } };
    if (villaId) filter.villaId = villaId;

    const houses = await House.find(filter)
      .populate("villaId", "name location") // fetch villa info
      .populate("currentTenantUserId", "name email");

    return res.json(houses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


export const createHouses = async (req, res) => {

try {

  const { error, value } = createHouseSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.message });

    const villa = await Villa.findById(value.villaId);
  
    if (!villa || villa.isDeleted) return res.status(400).json({ success: false, message: "Invalid villa ID" });

    const house = new House(value);
    const saved = await house.save();

    const populatedHouse = await House.findById(saved._id).populate("villaId", "name location");

    return res.status(201).json(populatedHouse);

} catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
}
};  

const updateHouseSchema = Joi.object({
  rentAmount: Joi.number().min(0).required(),
});


export const updateHouse = async (req, res) => {
  try {

    const { id } = req.params;

    const { error, value } = updateHouseSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ success: false, message: error.message });

    const house = await House.findById(id);
    if (!house || house.isDeleted) return res.status(404).json({ success: false, message: "House not found" });

    if (value.rentAmount === undefined) {
      return res.status(400).json({ message: "Rent amount is required" });
    }

    house.rentAmount = value.rentAmount;
    await house.save()
  
    const populated = await House.findById(house._id).populate("villaId", "name location");

    return res.status(201).json(populated);

  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteHouse = async (req, res) => {
    try {

      const { id } = req.params;
      const house = await House.findById(id);
      if (!house || house.isDeleted) return res.status(404).json({ success: false, message: "House not found" });
      
      house.isDeleted = true;
      await house.save();

      return res.json({ message: "House removed" });
    } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
    }
};
