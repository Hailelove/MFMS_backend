import express from "express";

import {
  getLoanTypes,
  getLoansOverview,
  getLoansByMember,
} from "../controllers/loanController.js";

const router = express.Router();

// Routes map to /admin/...
router.get("/loan-types", getLoanTypes);
router.get("/loans", getLoansOverview);
router.get("/loans/member/:memberId", getLoansByMember);

export default router;
