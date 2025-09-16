// models/Rental.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;


const rentalSchema = new Schema(
  {
    tenantUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    houseId: {
      type: Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    villaId: {
      type: Schema.Types.ObjectId,
      ref: "Villa",
      required: true,
    },
    rentAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    month: {
      type: Number, // 1–12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    paidDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


export const Rental = model("Rental", rentalSchema);
