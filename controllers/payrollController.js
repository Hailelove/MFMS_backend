import prisma from "../config/db.js";

export const uploadPayroll = async (req, res) => {
  const { payrollMonth, payrollYear, records } = req.body;
  const userId = req.user.id; // Correctly retrieved from middleware

  try {
    // 1. DUPLICATE CHECK
    const existing = await prisma.payrollUpload.findFirst({
      where: {
        payrollMonth: new Date(payrollYear, payrollMonth - 1),
        payrollYear,
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Payroll for this period already exists." });
    }

    // 2. ATOMIC TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      const upload = await tx.payrollUpload.create({
        data: {
          payrollMonth: new Date(payrollYear, payrollMonth - 1),
          payrollYear,
          uploadedById: userId,
        },
      });

      for (const row of records) {
        const member = await tx.member.findUnique({
          where: { employeeId: row.employeeId.toString() },
          include: { memberBalance: true },
        });

        // Create the record
        await tx.payrollRecord.create({
          data: {
            uploadId: upload.id,
            employeeId: row.employeeId.toString(),
            employeeName: row.employeeName,
            grossSalary: row.grossSalary,
            savingDeduction: row.savingDeduction,
            shareDeduction: row.shareDeduction,
            loanDeduction: row.loanDeduction,
            netSalary: row.netSalary,
            matchedMemberId: member?.id,
            verificationStatus: member ? "VERIFIED" : "DISCREPANCY",
          },
        });

        // 3. AUTOMATED FINANCIAL UPDATES
        if (member) {
          // Add Saving
          await tx.saving.create({
            data: {
              memberId: member.id,
              type: "DEPOSIT",
              category: "MONTHLY_SAVING",
              amount: row.savingDeduction,
              paymentMethod: "PAYROLL",
              createdById: userId,
            },
          });

          // Update Balance
          await tx.memberBalance.update({
            where: { memberId: member.id },
            data: {
              savingBalance: { increment: row.savingDeduction },
              shareBalance: { increment: row.shareDeduction },
            },
          });
        }
      }
      return upload;
    });

    res.status(201).json({
      message: "Payroll processed successfully.",
      uploadId: result.id,
    });
  } catch (error) {
    console.error("Payroll Upload Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during payroll processing." });
  }
};
