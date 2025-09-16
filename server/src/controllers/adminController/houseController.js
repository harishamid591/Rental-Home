import { House } from "../../models/House.js";
import { Villa } from "../../models/Villa.js";

// controllers/houseController.js
export const getHouses = async (req, res) => {
  try {
    const { villaId } = req.query; // ⬅️ take villaId from query params

    const filter = villaId ? { villaId } : {}; // if villaId is given, filter

    const houses = await House.find(filter)
      .populate("villaId", "name location") // fetch villa info
      .populate("currentTenantUserId", "name email");

    res.json(houses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


export const createHouses = async (req, res) => {

try {

    const { villaId, number, bedrooms, rentAmount } = req.body;


    // ensure villa exists
    const villa = await Villa.findById(villaId);
  
    if (!villa) return res.status(400).json({ message: "Invalid villa ID" });

    const house = new House({
    villaId,
    number,
    bedrooms,
    rentAmount,
    });

    const savedHouse = await house.save();

    const populatedHouse = await House.findById(savedHouse._id).populate("villaId");

    res.status(201).json(populatedHouse);

} catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
}
};  

// export const getHouseById = async (req, res) => {
//     try {
//       const house = await House.findById(req.params.id)
//         .populate("villaId", "name location")
//         .populate("currentTenantUserId", "name email");
  
//       if (!house) return res.status(404).json({ message: "House not found" });
  
//       res.json(house);
//     } catch (error) {
//       res.status(500).json({ message: "Server Error", error: error.message });
//     }
//   };

export const updateHouse = async (req, res) => {
  try {
    const { rentAmount } = req.body;

    if (rentAmount === undefined) {
      return res.status(400).json({ message: "Rent amount is required" });
    }

    const updatedHouse = await House.findByIdAndUpdate(
      req.params.id,
      { rentAmount },
      { new: true }
    );

    if (!updatedHouse) {
      return res.status(404).json({ message: "House not found" });
    }

    const populatedHouse = await House.findById(updatedHouse._id).populate("villaId");

    res.status(201).json(populatedHouse);

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteHouse = async (req, res) => {
    try {
    const house = await House.findByIdAndDelete(req.params.id);

    if (!house) return res.status(404).json({ message: "House not found" });

    res.json({ message: "House removed" });
    } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
    }
};
