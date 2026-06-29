const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // ==========================================
  // 1. CLEANUP (Correct order)
  // ==========================================
  console.log("Cleaning existing data...");

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.ledger.deleteMany();
  await prisma.payrollRecord.deleteMany();
  await prisma.payrollUpload.deleteMany();
  await prisma.loanRepayment.deleteMany();
  await prisma.guarantor.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.share.deleteMany();
  await prisma.saving.deleteMany();
  await prisma.member.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.campus.deleteMany();
  await prisma.loanType.deleteMany();
  await prisma.systemConfiguration.deleteMany();

  // ==========================================
  // 2. SYSTEM CONFIGURATION
  // ==========================================
  console.log("Seeding System Configuration...");

  const config = await prisma.systemConfiguration.create({
    data: {
      systemName: "University Saving, Share, Credit and Loan Management System",
      cooperativeInfo: "Mekdela Amba University Staff Cooperative",
      fiscalYear: "2026",
      defaultCurrency: "ETB",
      minMonthlySaving: 500,
      minMonthlyShare: 100,
      shareUnitPrice: 1000,
      defaultLoanInterestRate: 5.5,
      maxLoanMultiplier: 6,
      latePaymentPenaltyPercent: 2,
      defaultRepaymentPeriod: 36,
      gracePeriodDays: 5,
      maxActiveLoansPerMember: 1,
      minMembershipDurationDays: 180,
      sessionTimeoutMinutes: 15,
    },
  });

  // ==========================================
  // 3. ROLES + CAMPUSES
  // ==========================================
  console.log("Seeding Roles & Campuses...");

  const adminRole = await prisma.role.create({ data: { name: "ADMIN" } });
  const memberRole = await prisma.role.create({ data: { name: "MEMBER" } });

  const campus1 = await prisma.campus.create({
    data: {
      name: "Main Campus",
      code: "MC-01",
      location: "Tulu Awliya",
    },
  });

  const campus2 = await prisma.campus.create({
    data: {
      name: "Technology Campus",
      code: "TC-02",
      location: "Mekane Selam",
    },
  });

  // ==========================================
  // 4. USERS
  // ==========================================
  console.log("Seeding Users...");

  const hash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@coop.com",
      passwordHash: hash,
      roleId: adminRole.id,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      username: "john",
      email: "john@coop.com",
      passwordHash: hash,
      roleId: memberRole.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "jane",
      email: "jane@coop.com",
      passwordHash: hash,
      roleId: memberRole.id,
    },
  });

  // ==========================================
  // 5. STAFF (NO NAME FIELD - CORRECT)
  // ==========================================
  console.log("Seeding Staff...");

  await prisma.staff.createMany({
    data: [
      { role: "ADMINISTRATIVE", campusId: campus1.id },
      { role: "ACADEMIC", campusId: campus2.id },
    ],
  });

  // ==========================================
  // 6. MEMBERS
  // ==========================================
  console.log("Seeding Members...");

  const member1 = await prisma.member.create({
    data: {
      membershipNo: "MEM-001",
      employeeId: "EMP-001",
      fullName: "John Doe",
      phone: "0911000001",

      initialSavingAmount: 1000,
      initialShareAmount: 5000,
      monthlySalary: 15000,
      employmentStatus: "ACTIVE",
      status: "ACTIVE",
      campusId: campus1.id,
      userId: user1.id,
    },
  });

  const member2 = await prisma.member.create({
    data: {
      membershipNo: "MEM-002",
      employeeId: "EMP-002",
      fullName: "Jane Doe",
      phone: "0911000002",
      initialSavingAmount: 1200,
      initialShareAmount: 8000,

      monthlySalary: 22000,
      employmentStatus: "ACTIVE",
      status: "ACTIVE",
      campusId: campus2.id,
      userId: user2.id,
    },
  });

  // ==========================================
  // 7. SAVINGS
  // ==========================================
  console.log("Seeding Savings...");

  await prisma.saving.createMany({
    data: [
      {
        memberId: member1.id,
        type: "DEPOSIT",
        category: "MONTHLY_SAVING",
        amount: 500,
        paymentMethod: "PAYROLL",
        createdById: admin.id,
      },
      {
        memberId: member2.id,
        type: "DEPOSIT",
        category: "MONTHLY_SAVING",
        amount: 800,
        paymentMethod: "PAYROLL",
        createdById: admin.id,
      },
    ],
  });

  // ==========================================
  // 8. SHARES
  // ==========================================
  console.log("Seeding Shares...");

  await prisma.share.createMany({
    data: [
      {
        memberId: member1.id,
        transactionType: "INITIAL_SHARE",
        quantity: 5,
        unitPrice: 1000,
        totalAmount: 5000,
        cumulativeBalance: 5000,
        paymentMethod: "BANK",
        createdById: admin.id,
      },
      {
        memberId: member2.id,
        transactionType: "INITIAL_SHARE",
        quantity: 10,
        unitPrice: 1000,
        totalAmount: 10000,
        cumulativeBalance: 10000,
        paymentMethod: "BANK",
        createdById: admin.id,
      },
    ],
  });

  // ==========================================
  // 9. LOAN TYPES + LOANS
  // ==========================================
  console.log("Seeding Loans...");

  const loanType = await prisma.loanType.createMany({
    data: [
      { name: "Personal Loan", interestRate: 5.5, maxMultiplier: 6 },
      { name: "Emergency Loan", interestRate: 3, maxMultiplier: 2 },
    ],
  });

  const loanTypes = await prisma.loanType.findMany();

  const loan1 = await prisma.loan.create({
    data: {
      memberId: member1.id,
      loanTypeId: loanTypes[0].id,
      loanPurpose: "Home Repair",
      requestedAmount: 30000,
      approvedAmount: 30000,
      currentSavingBalance: 1500,
      currentShareBalance: 5000,
      status: "ACTIVE",
      approvedById: admin.id,
    },
  });

  const loan2 = await prisma.loan.create({
    data: {
      memberId: member2.id,
      loanTypeId: loanTypes[1].id,
      loanPurpose: "Medical",
      requestedAmount: 15000,
      currentSavingBalance: 800,
      currentShareBalance: 10000,
      status: "PENDING",
    },
  });

  // ==========================================
  // 10. GUARANTOR + REPAYMENT
  // ==========================================
  console.log("Seeding Guarantors & Repayments...");

  await prisma.guarantor.create({
    data: {
      loanId: loan1.id,
      memberId: member2.id,
      guaranteedAmount: 30000,
      status: "APPROVED",
    },
  });

  await prisma.loanRepayment.createMany({
    data: [
      {
        loanId: loan1.id,
        amount: 1320,
        paymentMethod: "PAYROLL",
        createdById: admin.id,
      },
      {
        loanId: loan1.id,
        amount: 1320,
        paymentMethod: "PAYROLL",
        createdById: admin.id,
      },
    ],
  });

  // ==========================================
  // 11. PAYROLL
  // ==========================================
  console.log("Seeding Payroll...");

  const payroll = await prisma.payrollUpload.create({
    data: {
      payrollMonth: new Date("2026-06-01"),
      payrollYear: 2026,
      uploadedById: admin.id,
    },
  });

  await prisma.payrollRecord.createMany({
    data: [
      {
        uploadId: payroll.id,
        employeeId: "EMP-001",
        grossSalary: 15000,
        savingDeduction: 500,
        shareDeduction: 0,
        loanDeduction: 1320,
        otherDeductions: 2000,
        netSalary: 11180,
        matchedMemberId: member1.id,
        verificationStatus: "VERIFIED",
      },
      {
        uploadId: payroll.id,
        employeeId: "EMP-002",
        grossSalary: 22000,
        savingDeduction: 800,
        shareDeduction: 100,
        loanDeduction: 0,
        otherDeductions: 3500,
        netSalary: 17600,
        matchedMemberId: member2.id,
        verificationStatus: "VERIFIED",
      },
    ],
  });

  // ==========================================
  // 12. LEDGERS
  // ==========================================
  console.log("Seeding Ledgers...");

  await prisma.ledger.createMany({
    data: [
      {
        ledgerType: "BANK",
        transactionType: "DEPOSIT",
        category: "Shares",
        amount: 15000,
        balance: 15000,
        createdById: admin.id,
      },
      {
        ledgerType: "UNION",
        transactionType: "DEPOSIT",
        category: "Savings",
        amount: 8000,
        balance: 23000,
        createdById: admin.id,
      },
    ],
  });

  // ==========================================
  // 13. NOTIFICATIONS + AUDIT
  // ==========================================
  console.log("Seeding Notifications...");

  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        title: "Welcome",
        message: "Your membership is active",
        type: "SYSTEM",
      },
      {
        userId: user2.id,
        title: "Loan Update",
        message: "Your loan is pending approval",
        type: "LOAN",
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SEED",
      tableName: "SYSTEM",
    },
  });

  console.log("✅ Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
