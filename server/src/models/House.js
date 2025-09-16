import mongoose from "mongoose";
const {Schema, model} = mongoose;


const houseSchema = new Schema({
    villaId:{
        type:Schema.Types.ObjectId,
        ref:"Villa",
        required:true,
    },
    number:{
        type:String,
        required:true
    },
    bedrooms:{
        type:Number,
    },
    isOccupied:{
        type:Boolean,
        default:false
    },
    currentTenantUserId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    rentAmount:{
        type:Number,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

houseSchema.pre("save", function (next) {
    this.isOccupied = !!this.currentTenantUserId; // true if tenant is assigned
    next();
  });

export const House = model("House",houseSchema);