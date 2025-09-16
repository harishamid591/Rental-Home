import mongoose from "mongoose";
const { Schema, model } = mongoose;

const tenantProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    qatarId: {
      type: String,
    },
    contact: {
      type: String,
    },
    deposit: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate:{
      type:Date
    },
    assignedHouseId: {
      type: Schema.Types.ObjectId,
      ref: "House",
      default: null, // null = no house assigned
    },
    isActive:{
      type:Boolean,
      default:true
    }
  },
  { timestamps: true }
);

export const TenantProfile = model("TenantProfile", tenantProfileSchema);
