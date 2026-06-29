import express from "express";
import { updateSystemConfiguration } from "../controllers/configController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only Admins can modify global settings
router.put("/update", protect, restrictTo("admin"), updateSystemConfiguration);

export default router;
