// routes/campusRoutes.js
import express from "express";

import {
  createCampus,
  getCampuses,
  updateCampus,
  deleteCampus,
  updateCampusStatus,
} from "../controllers/campusController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
const router = express.Router();

router
  .route("/")
  .get(getCampuses)
  .post(protect, restrictTo("admin"), createCampus);

router
  .route("/:id")
  .put(protect, restrictTo("admin"), updateCampus)
  .delete(protect, restrictTo("admin"), deleteCampus);

router
  .route("/:id/status")
  .patch(protect, restrictTo("admin"), updateCampusStatus);

export default router;
