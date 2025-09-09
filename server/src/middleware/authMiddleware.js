import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req,res,next)=>{

    const token = req.cookies?.token;

    if(!token) return res.status(401).json({message:"Not authorized, no token"});

    try {
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-passwordHash");
        next();

    } catch (error) {
        return res.status(401).json({message:"Not autorized, token failed"});
    }
}

// Role check middleware

export const adminOnly = (req, res, next)=>{
    if(req.user && req.user.role === "ADMIN"){
        next();
    }else{
        res.status(403).json({message:"Access denied. Admins only."})
    }
}