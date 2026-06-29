import express from "express";
import { getLedger } from "../controllers/ledgerController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only allow Admins and Staff to view the ledger history
router.get("/", protect, restrictTo("admin", "staff"), getLedger);

export default router;
