// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import Routes
import userRoutes from "./routes/userRoutes.js";
import campusRoutes from "./routes/campusRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import financeRoutes from "./routes/savingRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";

import morgan from "morgan";
import payrollRoutes from "./routes/payrollRoutes.js";
import ledgerRoutes from "./routes/ledgerRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev")); // Logger for debugging
app.use(express.json()); // Parses incoming JSON payloads

// Mount Routes
// Your React app is calling api.post('/users/login'), so we mount it at '/users'
app.use("/users", userRoutes);
app.use("/campuses", campusRoutes);
app.use("/staff", staffRoutes);
app.use("/admin", financeRoutes);

app.use("/admin", loanRoutes);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/payroll", payrollRoutes);
app.use("/api/ledger", ledgerRoutes);

// Basic health check route
app.get("/", (req, res) => {
  res.send("Microfinance API is running...");
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
