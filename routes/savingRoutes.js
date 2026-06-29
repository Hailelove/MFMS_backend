import express from "express";
import { getAllMembers } from "../controllers/userController.js";
import {
  getFinancialOverview,
  getMemberFinancialDetails,
  recordSavingTransaction,
  recordShareTransaction,
  deleteSavingTransaction,
  deleteShareTransaction,
} from "../controllers/savingController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js"; // Adjust path to your auth middleware

const router = express.Router();

// Apply auth middleware to all routes (Only Admins/Officers should access this)
router.use(protect);
router.use(restrictTo("admin"));

// Overview & Detailed Ledgers
router.get("/savings", getFinancialOverview);
router.get("/member-finance/:memberId", getMemberFinancialDetails);

// Record Transactions

router.post("/savings/:userId/transaction", recordSavingTransaction);
router.post("/shares/:userId/transaction", recordShareTransaction);

// Delete/Purge Transactions
router.delete(
  "/savings/:userId/transaction/:transactionId",
  deleteSavingTransaction,
);
router.delete(
  "/shares/:userId/transaction/:transactionId",
  deleteShareTransaction,
);

router.get("/users", getAllMembers);

export default router;
