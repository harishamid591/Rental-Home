import mongoose from "mongoose";
const {Schema, model} = mongoose;


const tenantProfileSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    qatarId:{
        type:String
    },
    agreement:{
        start:{
            type:Date
        },
        end:{
            type:Date
        }
    },
    contact:{
        type:String
    },
    deposit:{
        type:Number,
        default:0
    },
    rentDueDay:{
        type:Number,
        min:1,
        max:28
    }
},{timestamps:true})

export const TenantProfile = model("TenantProfile",tenantProfileSchema)