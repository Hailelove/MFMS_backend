const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // ==========================================
  // 1. CLEANUP (SAFE ORDER)
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

  // ❌ STAFF REMOVED COMPLETELY (as per your new design)

  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.staffType.deleteMany();
  await prisma.campus.deleteMany();
  await prisma.loanType.deleteMany();
  await prisma.systemConfiguration.deleteMany();

  // ==========================================
  // 2. SYSTEM CONFIG
  // ==========================================
  console.log("Seeding System Configuration...");

  await prisma.systemConfiguration.create({
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
      name: "Branch Campus",
      code: "TC-02",
      location: "Mekane Selam",
    },
  });

  // ==========================================
  // 4. STAFF TYPES (GLOBAL MASTER DATA)
  // ==========================================
  console.log("Seeding Staff Types...");

  const adminType = await prisma.staffType.create({
    data: { name: "ADMIN" },
  });

  const academicType = await prisma.staffType.create({
    data: { name: "ACADEMIC" },
  });

  // ==========================================
  // 5. USERS
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
  // 6. MEMBERS (NOW INCLUDE STAFF TYPE)
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
      staffTypeId: adminType.id,
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
      staffTypeId: academicType.id,
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
  // 9. LOANS
  // ==========================================
  console.log("Seeding Loans...");

  await prisma.loanType.createMany({
    data: [
      { name: "Personal Loan", interestRate: 5.5, maxMultiplier: 6 },
      { name: "Emergency Loan", interestRate: 3, maxMultiplier: 2 },
    ],
  });

  const loanTypes = await prisma.loanType.findMany();

  await prisma.loan.create({
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

  await prisma.loan.create({
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
