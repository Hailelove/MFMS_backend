// // routes/campusRoutes.js
// import express from "express";

// import {
//   createCampus,
//   getCampuses,
//   updateCampus,
//   deleteCampus,
//   updateCampusStatus,
//   getStaffTypes,
//   createStaffType,
//   deleteStaffType,
//   updateStaffType,
// } from "../controllers/campusController.js";
// import { protect, restrictTo } from "../middleware/authMiddleware.js";
// const router = express.Router();

// router.get("/staff-types", getStaffTypes);
// router.post("/staff-types", createStaffType);
// router.delete("/staff-types/:id", deleteStaffType);
// router.put("/staff-types/:id", updateStaffType);

// router
//   .route("/")
//   .get(getCampuses)
//   .post(protect, restrictTo("admin"), createCampus);

// router
//   .route("/:id")
//   .put(protect, restrictTo("admin"), updateCampus)
//   .delete(protect, restrictTo("admin"), deleteCampus);

// router
//   .route("/:id/status")
//   .patch(protect, restrictTo("admin"), updateCampusStatus);

// export default router;
import express from "express";
import {
  createCampus,
  getCampuses,
  updateCampus,
  deleteCampus,
  updateCampusStatus,
  getStaffTypes,
  createStaffType,
  deleteStaffType,
  updateStaffType,
  assignStaffTypeToCampus,
} from "../controllers/campusController.js";

import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * STAFF TYPE ROUTES
 */
router.get("/staff-types", getStaffTypes);
router.post("/staff-types", createStaffType);
router.put("/staff-types/:id", updateStaffType);
router.delete("/staff-types/:id", deleteStaffType);
router.post("/campus-staff-types", assignStaffTypeToCampus);

/**
 * CAMPUS ROUTES
 */
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
