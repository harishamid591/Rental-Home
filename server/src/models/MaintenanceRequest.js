import mongoose from "mongoose";
const {Schema, model} = mongoose;


const maintenanceSchema = new Schema({
    tenantUserId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    houseId:{
        type:Schema.Types.ObjectId,
        ref:"House",
        required:true
    },
    category:{
        type:String,
        enum:["AC","Plumbing","Electrical","Painting","Other"],
        required:true
    },
    title:{
        type:String,
    },
    description:{
        type:String
    },
    image:[String],
    priority:{
        type:String,
        enum:["low","normal",high],
        default:"normal"
    },
    status:{
        type:String,
        enum:["pending","in_progress","completed","rejected"],
    },
    assignedToUserId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    openedAt:{
        type:Date,
        default:Date.now()
    },
    updateAt:{
        type:Date
    },
    closedAt:{
        type:Date
    }
},{
    timestamps:true
})

export const MaintenanceRequest = model("MaintenanceRequest",maintenanceSchema);
