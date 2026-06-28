import express from "express";
import { registerStaff } from "../controllers/staffController.js";
const router = express.Router();

// Maps to: POST /users/login
router.post("/", registerStaff);

export default router;
