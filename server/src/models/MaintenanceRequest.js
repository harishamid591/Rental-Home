import mongoose from "mongoose";
const {Schema, model} = mongoose;


const maintenanceSchema = new Schema(
    {
      villaId: { type: mongoose.Schema.Types.ObjectId, ref: "Villa", required: true },
      houseId: { type: mongoose.Schema.Types.ObjectId, ref: "House", required: true },
      tenantName: { type: String },
      date: { type: Date, required: true },
      issue: { type: String, required: true },
      cost: { type: Number, required: true },
    },
    { timestamps: true }
  );

export const MaintenanceRequest = model("MaintenanceRequest",maintenanceSchema);
