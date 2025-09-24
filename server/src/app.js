import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import villaRoutes from "./routes/villaRoutes.js";
import houseRoutes from "./routes/houseRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import electricityRoutes from "./routes/electricityRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";



import userRoutes from "./routes/userRoutes/userRoutes.js";


const app = express();


app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }));

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }



// Routes
app.use('/api/auth',authRoutes);
app.use("/api/villas", villaRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/tenantProfiles", tenantRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/maintenance",maintenanceRoutes)
app.use("/api/electricity",electricityRoutes)
app.use("/api/reports",reportRoutes)
app.use("/api/adminDashboard",dashboardRoutes)

app.use("/api/user",userRoutes)

// Not found handler
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  });

export default app;