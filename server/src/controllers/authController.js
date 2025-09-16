import {User} from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";


export const register = async(req,res)=>{
    try {
        const {name, email, phone, password} = req.body;

        const exists = await User.findOne({email})

        if(exists) return res.status(400).json({message:"User already exists"});

        const passwordHash = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            phone,
            passwordHash,
            role:"TENANT"
        });

        const token = generateToken(user);


        res.cookie("token",token,{
            httpOnly:false,
            secure: process.env.NODE_ENV === "production",
            sameSite:"strict"
        })

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        })

    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

export const login = async(req,res)=>{
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message:"Invalid credentials"});

        const isMatch = await bcrypt.compare(password,user.passwordHash);
        if(!isMatch) return res.status(400).json({message:"Invalid credentials"});


        const token = generateToken(user);


        res.cookie("token", token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict"
        });


        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        })

    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

// POST /api/auth/logout
export const logout = (req, res) => {
    res.clearCookie("token", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "Logged out" });
  };

// GET /api/auth/me
export const getMe = (req, res) => {
    res.json(req.user); // `req.user` comes from protect middleware
  };  

