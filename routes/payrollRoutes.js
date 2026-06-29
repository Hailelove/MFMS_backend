import express from "express";
import { uploadPayroll } from "../controllers/payrollController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only ADMIN can upload payroll
router.post("/upload", protect, restrictTo("admin"), uploadPayroll);

export default router;
