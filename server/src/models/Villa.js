import mongoose from "mongoose";
const {Schema, model} = mongoose;


const villaSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      location: {
        type: String,
        required: true,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    { timestamps: true }
  );

export const Villa = model("Villa", villaSchema);