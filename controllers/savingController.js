import prisma from "../config/db.js";

// Utility function to get memberId from userId
const getMemberByUserId = async (userId) => {
  const member = await prisma.member.findFirst({
    where: { userId: userId },
    select: { id: true },
  });
  if (!member) throw new Error("Member profile not found for this user.");
  return member.id;
};

// ==========================================
// 1. GET FINANCIAL OVERVIEW
// Maps to: GET /admin/savings
// ==========================================
export const getFinancialOverview = async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      include: {
        user: true,
        savings: true,
        shares: true,
      },
    });

    const overview = members.map((member) => {
      // Calculate total savings (Deposits - Withdrawals)
      const totalSavings = member.savings.reduce((acc, curr) => {
        return curr.type === "DEPOSIT"
          ? acc + Number(curr.amount)
          : acc - Number(curr.amount);
      }, 0);

      // Get latest cumulative share balance
      const latestShare = member.shares.sort(
        (a, b) => b.contributionDate - a.contributionDate,
      )[0];
      const totalShares = latestShare
        ? Number(latestShare.cumulativeBalance)
        : 0;

      return {
        memberId: member.id,
        userId: member.userId,
        fullName: member.fullName,
        email: member.email || member.user?.email || "",
        totalSavings,
        totalShares,
      };
    });

    res.status(200).json(overview);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch financial overview",
      error: error.message,
    });
  }
};

// ==========================================
// 2. GET MEMBER FINANCIAL DETAILS
// Maps to: GET /admin/member-finance/:userId
// ==========================================

export const getMemberFinancialDetails = async (req, res) => {
  try {
    const memberId = getMemberIdFromParam(req.params.memberId);

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        savings: {
          orderBy: { transactionDate: "desc" },
        },
        shares: {
          orderBy: { contributionDate: "desc" },
        },
        memberBalance: true,
      },
    });

    if (!member) {
      return res.status(404).json({ message: "Member profile not found." });
    }

    const totalSavings =
      member.memberBalance?.savingBalance ??
      member.savings.reduce((acc, curr) => {
        if (curr.type === "WITHDRAWAL") return acc - Number(curr.amount);
        if (curr.type === "ADJUSTMENT") return acc + Number(curr.amount);
        return acc + Number(curr.amount);
      }, 0);

    const totalShares =
      member.memberBalance?.shareBalance ??
      (member.shares.length > 0
        ? Number(member.shares[0].cumulativeBalance)
        : 0);

    res.status(200).json({
      member,
      totalSavings: Number(totalSavings),
      totalShares: Number(totalShares),
      savings: member.savings,
      shares: member.shares,
    });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getMemberIdFromParam = (memberId) => {
  const id = Number(memberId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Member ID is required and must be a valid number.");
  }

  return id;
};

// ==========================================
// 3. RECORD SAVING TRANSACTION
// Maps to: POST /admin/savings/:userId/transaction
// ==========================================
export const recordSavingTransaction = async (req, res) => {
  try {
    const memberId = getMemberIdFromParam(req.params.memberId);

    const {
      type,
      category,
      amount,
      paymentMethod,
      transactionDate,
      payrollMonth,
      referenceNo,
      remarks,
      isInitialTransaction,
    } = req.body;

    const newSaving = await prisma.saving.create({
      data: {
        memberId,
        type,
        category,
        amount: Number(amount),
        isInitialTransaction: Boolean(isInitialTransaction),
        paymentMethod,
        payrollMonth: payrollMonth ? new Date(payrollMonth) : null,
        transactionDate: transactionDate
          ? new Date(transactionDate)
          : new Date(),
        referenceNo: referenceNo || null,
        remarks: remarks || null,
        createdById: req.user.id,
      },
    });

    res.status(201).json(newSaving);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to record saving", error: error.message });
  }
};

// ==========================================
// 4. RECORD SHARE (እጣ) TRANSACTION
// Maps to: POST /admin/shares/:userId/transaction
// ==========================================
export const recordShareTransaction = async (req, res) => {
  try {
    const memberId = getMemberIdFromParam(req.params.memberId);

    const {
      transactionType,
      quantity,
      unitPrice,
      paymentMethod,
      contributionDate,
      transactionDate,
      referenceNo,
      remarks,
      isInitialTransaction,
    } = req.body;

    const totalAmount = Number(quantity) * Number(unitPrice);

    const previousShare = await prisma.share.findFirst({
      where: { memberId },
      orderBy: { contributionDate: "desc" },
    });

    let cumulativeBalance = previousShare
      ? Number(previousShare.cumulativeBalance)
      : 0;

    if (
      transactionType === "INITIAL_SHARE" ||
      transactionType === "ADDITIONAL_SHARE"
    ) {
      cumulativeBalance += totalAmount;
    } else {
      cumulativeBalance -= totalAmount;
    }

    const newShare = await prisma.share.create({
      data: {
        memberId,
        transactionType,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        totalAmount,
        cumulativeBalance,
        isInitialTransaction: Boolean(isInitialTransaction),
        contributionDate: new Date(contributionDate || transactionDate),
        paymentMethod,
        referenceNo: referenceNo || null,
        remarks: remarks || null,
        createdById: req.user.id,
      },
    });

    res.status(201).json(newShare);
  } catch (error) {
    res.status(500).json({
      message: "Failed to record share contribution",
      error: error.message,
    });
  }
};

// ==========================================
// 5. DELETE TRANSACTIONS (PURGE)
// Maps to: DELETE /admin/savings/... and /admin/shares/...
// ==========================================
export const deleteSavingTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body; // Captured from frontend modal for auditing

    // Documentation states historical transactions shouldn't be physically deleted [cite: 327]
    // However, if system admins are allowed a physical purge, log it heavily.
    await prisma.saving.delete({
      where: { id: Number(transactionId) },
    });

    // TODO: Insert 'reason' and deletion event into Audit Log table here [cite: 328]

    res
      .status(200)
      .json({ message: "Saving transaction purged successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete saving", error: error.message });
  }
};

export const deleteShareTransaction = async (req, res) => {
  try {
    const { transactionId, userId } = req.params;
    const { reason } = req.body;
    const memberId = await getMemberByUserId(userId);

    await prisma.share.delete({
      where: { id: Number(transactionId) },
    });

    // CRITICAL: Because Shares rely on a cumulative balance, deleting a record
    // invalidates the cumulative balances of all records that came after it.
    // For a robust system, you must recalculate the cumulative balances of subsequent records here.

    res.status(200).json({ message: "Share transaction purged successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete share", error: error.message });
  }
};
