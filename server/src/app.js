import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import villaRoutes from "./routes/villaRoutes.js";


const app = express();


app.use(helmet());
app.use(cookieParser());
app.use(cors({origin:"http://localhost:5173", credentials:true}));
app.use(express.json());
app.use(morgan("dev"));



// Routes
app.use('/api/auth',authRoutes);
app.use("/api/villas", villaRoutes);

export default app;