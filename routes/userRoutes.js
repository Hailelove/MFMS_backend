// routes/userRoutes.js
import express from "express";
import { loginUser, registerMember } from "../controllers/userController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Maps to: POST /users/login
router.post("/login", loginUser);
router.post("/register-member", protect, restrictTo("admin"), registerMember);

export default router;
