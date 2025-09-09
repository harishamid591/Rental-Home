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
    floor:{
        type:Number,
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
    dueDay:{
        type:Number,
        min:1,
        max:28,
        required:true
    }
},{timestamps:true});

export const House = model("House",houseSchema);