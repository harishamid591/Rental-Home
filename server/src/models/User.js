import mongoose from "mongoose";
const {Schema, model} = mongoose;

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    phone:{
        type:String,
        required:true,
    },
    passwordHash:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["ADMIN","TENANT"],
        default:"TENANT"
    },
    status:{
        type:String,
        enum:["active","inactive"],
        default:"active",
    }
},{timestamps:true})


export const User = model("User",userSchema);
