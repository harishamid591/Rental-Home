import mongoose from "mongoose";
const {Schema, model} = mongoose;


const villaSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    code:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true,
    }
},{timestamps:true});

export const Villa = model("Villa", villaSchema);