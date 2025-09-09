import mongoose from "mongoose";
const {Schema ,model} = mongoose;


const paymentSchema = new Schema({
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
    month:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    method:{
        type:String,
        enum:["cash","upi","card","bank"],
        default:"cash"
    },
    status:{
        type:String,
        enum:["paid","pending","failed"],
        default:"pending"
    },
    paidAt:{
        type:Date
    }
},{timestamps:true})


export const Payment = model("Payment",paymentSchema);