import {User} from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";


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
          sameSite: "Strict"
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


