import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getLoanTypes = async (req, res) => {
  try {
    const loanTypes = await prisma.loanType.findMany();
    res.json(loanTypes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching loan types" });
  }
};

export const getLoansOverview = async (req, res) => {
  try {
    // Aggregating loans by member
    const loans = await prisma.loan.findMany({
      include: { member: true, loanType: true },
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching loans overview" });
  }
};

// Add this to src/controllers/adminLoanController.js
export const getLoansByMember = async (req, res) => {
  const { memberId } = req.params;
  try {
    const loans = await prisma.loan.findMany({
      where: {
        memberId: parseInt(memberId),
      },
      include: {
        loanType: true,
        repayments: true,
      },
      orderBy: { applicationDate: "desc" },
    });
    res.json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching member loans" });
  }
};
