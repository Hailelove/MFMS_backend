import express from "express";
import {
  getStaffTypes,
  createStaffType,
  deleteStaffType,
  updateStaffType,
} from "../controllers/campusController.js";

const router = express.Router();

router.get("/", getStaffTypes);
router.post("/", createStaffType);
router.delete("/:id", deleteStaffType);
router.put("/:id", updateStaffType);

export default router;
