import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "tenant"],
    default: "tenant",
  },
  isDeleted:{
    type:Boolean,
    default:false
  }
}, { timestamps: true });

export const User = model("User", userSchema);
