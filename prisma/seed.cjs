const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // ==========================================
  // 1. CLEANUP (Reverse dependency order)
  // ==========================================
  console.log("Cleaning existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.unionLedger.deleteMany();
  await prisma.bankLedger.deleteMany();
  await prisma.payrollRecord.deleteMany();
  await prisma.payrollUpload.deleteMany();
  await prisma.loanRepayment.deleteMany();
  await prisma.guarantor.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.share.deleteMany();
  await prisma.saving.deleteMany();
  await prisma.member.deleteMany();
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
      minMonthlySaving: 500.0,
      minMonthlyShare: 100.0,
      shareUnitPrice: 1000.0,
      defaultLoanInterestRate: 5.5,
      maxLoanMultiplier: 6.0,
      latePaymentPenaltyPercent: 2.0,
      defaultRepaymentPeriod: 36,
      gracePeriodDays: 5,
      maxActiveLoansPerMember: 1,
      minMembershipDurationDays: 180, // 6 months
      sessionTimeoutMinutes: 15,
    },
  });

  // ==========================================
  // 3. ROLES & CAMPUSES
  // ==========================================
  console.log("Seeding Roles and Campuses...");
  const roleAdmin = await prisma.role.create({ data: { name: "ADMIN" } });
  const roleMember = await prisma.role.create({ data: { name: "MEMBER" } });

  const campusMain = await prisma.campus.create({
    data: { name: "Main Campus", code: "MC-01", location: "Tulu Awliya" },
  });
  const campusTech = await prisma.campus.create({
    data: {
      name: "Institute of Technology",
      code: "IOT-02",
      location: "Mekane Selam",
    },
  });

  // ==========================================
  // 4. USERS
  // ==========================================
  console.log("Seeding Users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@mau.edu.et",
      passwordHash: passwordHash,
      isActive: true,
      roleId: roleAdmin.id,
    },
  });

  const staffUser1 = await prisma.user.create({
    data: {
      username: "johndoe",
      email: "john.doe@mau.edu.et",
      passwordHash: passwordHash,
      isActive: true,
      roleId: roleMember.id,
    },
  });

  const staffUser2 = await prisma.user.create({
    data: {
      username: "janedoe",
      email: "jane.doe@mau.edu.et",
      passwordHash: passwordHash,
      isActive: true,
      roleId: roleMember.id,
    },
  });

  // ==========================================
  // 5. MEMBERS
  // ==========================================
  console.log("Seeding Members...");
  const member1 = await prisma.member.create({
    data: {
      membershipNo: "MAU-COOP-001",
      employeeId: "EMP-1001",
      fullName: "John Doe",
      gender: "Male",
      phone: "+251911000001",
      department: "Software Engineering",
      position: "Lecturer",
      monthlySalary: 15000.0,
      employmentStatus: "ACTIVE",
      status: "ACTIVE",
      campusId: campusMain.id,
      userId: staffUser1.id,
      registrationDate: new Date("2024-01-01"),
      approvalDate: new Date("2024-01-05"),
    },
  });

  const member2 = await prisma.member.create({
    data: {
      membershipNo: "MAU-COOP-002",
      employeeId: "EMP-1002",
      fullName: "Jane Doe",
      gender: "Female",
      phone: "+251911000002",
      department: "Computer Science",
      position: "Assistant Professor",
      monthlySalary: 22000.0,
      employmentStatus: "ACTIVE",
      status: "ACTIVE",
      campusId: campusTech.id,
      userId: staffUser2.id,
      registrationDate: new Date("2024-02-01"),
      approvalDate: new Date("2024-02-05"),
    },
  });

  // ==========================================
  // 6. SAVINGS & SHARES
  // ==========================================
  console.log("Seeding Savings and Shares...");
  await prisma.saving.createMany({
    data: [
      {
        memberId: member1.id,
        type: "DEPOSIT",
        category: "MONTHLY_SAVING",
        amount: 500.0,
        paymentMethod: "PAYROLL",
        createdById: adminUser.id,
      },
      {
        memberId: member1.id,
        type: "DEPOSIT",
        category: "ADDITIONAL_SAVING",
        amount: 1000.0,
        paymentMethod: "BANK",
        createdById: adminUser.id,
      },
      {
        memberId: member2.id,
        type: "DEPOSIT",
        category: "MONTHLY_SAVING",
        amount: 800.0,
        paymentMethod: "PAYROLL",
        createdById: adminUser.id,
      },
    ],
  });

  await prisma.share.createMany({
    data: [
      {
        memberId: member1.id,
        transactionType: "INITIAL_SHARE",
        quantity: 5,
        unitPrice: 1000.0,
        totalAmount: 5000.0,
        cumulativeBalance: 5000.0,
        paymentMethod: "BANK",
        createdById: adminUser.id,
      },
      {
        memberId: member2.id,
        transactionType: "INITIAL_SHARE",
        quantity: 10,
        unitPrice: 1000.0,
        totalAmount: 10000.0,
        cumulativeBalance: 10000.0,
        paymentMethod: "BANK",
        createdById: adminUser.id,
      },
    ],
  });

  // ==========================================
  // 7. LOAN TYPES & LOANS
  // ==========================================
  console.log("Seeding Loans...");
  const personalLoanType = await prisma.loanType.create({
    data: { name: "Personal Loan", interestRate: 5.5, maxMultiplier: 6.0 },
  });

  const emergencyLoanType = await prisma.loanType.create({
    data: { name: "Emergency Loan", interestRate: 3.0, maxMultiplier: 2.0 },
  });

  const activeLoan = await prisma.loan.create({
    data: {
      memberId: member1.id,
      loanTypeId: personalLoanType.id,
      loanPurpose: "House Renovation",
      requestedAmount: 30000.0,
      approvedAmount: 30000.0,
      currentSavingBalance: 1500.0,
      currentShareBalance: 5000.0,
      interestRate: 5.5,
      repaymentPeriod: 24,
      monthlyInstallment: 1320.5,
      status: "ACTIVE",
      applicationDate: new Date("2025-01-10"),
      approvalDate: new Date("2025-01-15"),
      disbursementDate: new Date("2025-01-18"),
      approvedById: adminUser.id,
    },
  });

  const pendingLoan = await prisma.loan.create({
    data: {
      memberId: member2.id,
      loanTypeId: emergencyLoanType.id,
      loanPurpose: "Medical Emergency",
      requestedAmount: 15000.0,
      currentSavingBalance: 800.0,
      currentShareBalance: 10000.0,
      status: "PENDING",
    },
  });

  // ==========================================
  // 8. GUARANTORS & REPAYMENTS
  // ==========================================
  console.log("Seeding Guarantors and Repayments...");
  await prisma.guarantor.create({
    data: {
      loanId: activeLoan.id,
      memberId: member2.id,
      guaranteedAmount: 30000.0,
      employmentStatus: "ACTIVE",
      status: "APPROVED",
      approvalDate: new Date("2025-01-14"),
    },
  });

  await prisma.loanRepayment.createMany({
    data: [
      {
        loanId: activeLoan.id,
        amount: 1320.5,
        paymentMethod: "PAYROLL",
        createdById: adminUser.id,
      },
      {
        loanId: activeLoan.id,
        amount: 1320.5,
        paymentMethod: "PAYROLL",
        createdById: adminUser.id,
      },
    ],
  });

  // ==========================================
  // 9. PAYROLL
  // ==========================================
  console.log("Seeding Payroll...");
  const payrollUpload = await prisma.payrollUpload.create({
    data: {
      payrollMonth: new Date("2026-06-01"),
      payrollYear: 2026,
      fileName: "June_2026_Payroll.xlsx",
      uploadedById: adminUser.id,
    },
  });

  await prisma.payrollRecord.createMany({
    data: [
      {
        uploadId: payrollUpload.id,
        employeeId: "EMP-1001",
        employeeName: "John Doe",
        grossSalary: 15000.0,
        savingDeduction: 500.0,
        shareDeduction: 0.0,
        loanDeduction: 1320.5,
        otherDeductions: 2000.0,
        netSalary: 11179.5,
        matchedMemberId: member1.id,
        verificationStatus: "VERIFIED",
      },
      {
        uploadId: payrollUpload.id,
        employeeId: "EMP-1002",
        employeeName: "Jane Doe",
        grossSalary: 22000.0,
        savingDeduction: 800.0,
        shareDeduction: 100.0,
        loanDeduction: 0.0,
        otherDeductions: 3500.0,
        netSalary: 17600.0,
        matchedMemberId: member2.id,
        verificationStatus: "VERIFIED",
      },
    ],
  });

  // ==========================================
  // 10. LEDGERS, NOTIFICATIONS & AUDIT LOGS
  // ==========================================
  console.log("Seeding Ledgers and Logs...");
  await prisma.bankLedger.create({
    data: {
      type: "DEPOSIT",
      category: "Share Contribution",
      amount: 15000.0,
      description: "Initial shares deposit for John and Jane",
      balance: 15000.0,
      createdById: adminUser.id,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: staffUser1.id,
        title: "Loan Approved",
        message: "Your personal loan has been approved.",
        type: "LOAN_INFO",
      },
      {
        userId: staffUser2.id,
        title: "Membership Approved",
        message: "Welcome to the MAU Cooperative!",
        type: "SYSTEM",
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "CREATED",
      tableName: "SystemConfiguration",
      recordId: 1,
    },
  });

  console.log("✅ Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
