import mongoose from "mongoose";

const electricitySchema = new mongoose.Schema({
  villaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Villa",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

export const Electricity = mongoose.model("Electricity", electricitySchema);
