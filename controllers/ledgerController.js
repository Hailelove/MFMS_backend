import prisma from "../config/db.js";

// GET /api/ledger?type=UNION
export const getLedger = async (req, res) => {
  const { type } = req.query; // Expecting 'UNION' or 'BANK'
  try {
    const ledgers = await prisma.ledger.findMany({
      where: { ledgerType: type },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(ledgers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch ledger data", error: error.message });
  }
};

// INTERNAL HELPER: Call this inside transactions from other controllers
export const addLedgerEntry = async (tx, entryData) => {
  // 1. Find the last balance for this ledger type
  const lastEntry = await tx.ledger.findFirst({
    where: { ledgerType: entryData.ledgerType },
    orderBy: { createdAt: "desc" },
  });

  const previousBalance = lastEntry ? Number(lastEntry.balance) : 0;
  const amount = Number(entryData.amount);

  // 2. Calculate new running balance
  const newBalance =
    entryData.transactionType === "DEPOSIT"
      ? previousBalance + amount
      : previousBalance - amount;

  // 3. Create the ledger record
  return await tx.ledger.create({
    data: {
      ...entryData,
      balance: newBalance,
    },
  });
};
