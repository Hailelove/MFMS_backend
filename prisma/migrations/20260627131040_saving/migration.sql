-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'RESIGNED', 'RETIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "SavingCategory" AS ENUM ('MONTHLY_SAVING', 'ADDITIONAL_SAVING', 'WITHDRAWAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ShareTransactionType" AS ENUM ('INITIAL_SHARE', 'ADDITIONAL_SHARE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "LedgerTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'QUEUED', 'APPROVED', 'REJECTED', 'DISBURSED', 'ACTIVE', 'COMPLETED', 'OVERDUE', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK', 'PAYROLL');

-- CreateTable
CREATE TABLE "SystemConfiguration" (
    "id" SERIAL NOT NULL,
    "systemName" TEXT NOT NULL DEFAULT 'University Saving, Share, Credit and Loan Management System',
    "cooperativeInfo" TEXT,
    "fiscalYear" TEXT,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'ETB',
    "minMonthlySaving" DECIMAL(12,2) NOT NULL,
    "minMonthlyShare" DECIMAL(12,2) NOT NULL,
    "shareUnitPrice" DECIMAL(12,2) NOT NULL,
    "defaultLoanInterestRate" DECIMAL(5,2) NOT NULL,
    "maxLoanMultiplier" DECIMAL(5,2) NOT NULL,
    "latePaymentPenaltyPercent" DECIMAL(5,2) NOT NULL,
    "defaultRepaymentPeriod" INTEGER NOT NULL,
    "gracePeriodDays" INTEGER NOT NULL,
    "maxActiveLoansPerMember" INTEGER NOT NULL,
    "minMembershipDurationDays" INTEGER NOT NULL,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 15,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" INTEGER,

    CONSTRAINT "SystemConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" "RoleName" NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT,
    "contactPerson" TEXT,
    "contactNumber" TEXT,
    "email" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "campusId" INTEGER NOT NULL,
    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "membershipNo" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "phone" TEXT,
    "email" TEXT,
    "residentialAddress" TEXT,
    "nationalId" TEXT,
    "emergencyContact" TEXT,
    "maritalStatus" TEXT,
    "emergencyContactRel" TEXT,
    "department" TEXT,
    "collegeFaculty" TEXT,
    "officeUnit" TEXT,
    "position" TEXT,
    "employmentType" TEXT,
    "monthlySalary" DECIMAL(12,2) NOT NULL,
    "dateOfEmployment" TIMESTAMP(3),
    "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "highestEducation" TEXT,
    "fieldOfStudy" TEXT,
    "educationalInstitution" TEXT,
    "graduationYear" INTEGER,
    "status" "MemberStatus" NOT NULL DEFAULT 'PENDING',
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvalDate" TIMESTAMP(3),
    "membershipRemarks" TEXT,
    "campusId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saving" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" "SavingCategory" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "payrollMonth" TIMESTAMP(3),
    "referenceNo" TEXT,
    "remarks" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER,

    CONSTRAINT "Saving_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Share" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "transactionType" "ShareTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "cumulativeBalance" DECIMAL(12,2) NOT NULL,
    "contributionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "referenceNo" TEXT,
    "remarks" TEXT,
    "createdById" INTEGER,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "maxMultiplier" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "LoanType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "loanTypeId" INTEGER NOT NULL,
    "loanPurpose" TEXT,
    "requestedAmount" DECIMAL(12,2) NOT NULL,
    "approvedAmount" DECIMAL(12,2),
    "currentSavingBalance" DECIMAL(12,2) NOT NULL,
    "currentShareBalance" DECIMAL(12,2) NOT NULL,
    "existingLoanBalance" DECIMAL(12,2),
    "interestRate" DECIMAL(5,2),
    "repaymentPeriod" INTEGER,
    "monthlyInstallment" DECIMAL(12,2),
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvalDate" TIMESTAMP(3),
    "disbursementDate" TIMESTAMP(3),
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "queuePosition" INTEGER,
    "approvedById" INTEGER,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guarantor" (
    "id" SERIAL NOT NULL,
    "loanId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "guaranteedAmount" DECIMAL(12,2) NOT NULL,
    "employmentStatus" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvalDate" TIMESTAMP(3),
    "remarks" TEXT,

    CONSTRAINT "Guarantor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanRepayment" (
    "id" SERIAL NOT NULL,
    "loanId" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "referenceNo" TEXT,
    "createdById" INTEGER,

    CONSTRAINT "LoanRepayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollUpload" (
    "id" SERIAL NOT NULL,
    "payrollMonth" TIMESTAMP(3) NOT NULL,
    "payrollYear" INTEGER NOT NULL,
    "fileName" TEXT,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" INTEGER NOT NULL,

    CONSTRAINT "PayrollUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRecord" (
    "id" SERIAL NOT NULL,
    "uploadId" INTEGER NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT,
    "campusName" TEXT,
    "department" TEXT,
    "grossSalary" DECIMAL(12,2) NOT NULL,
    "savingDeduction" DECIMAL(12,2) NOT NULL,
    "shareDeduction" DECIMAL(12,2) NOT NULL,
    "loanDeduction" DECIMAL(12,2) NOT NULL,
    "otherDeductions" DECIMAL(12,2) NOT NULL,
    "netSalary" DECIMAL(12,2) NOT NULL,
    "matchedMemberId" INTEGER,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,

    CONSTRAINT "PayrollRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankLedger" (
    "id" SERIAL NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "LedgerTransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "referenceNo" TEXT,
    "description" TEXT,
    "balance" DECIMAL(12,2) NOT NULL,
    "relatedMemberId" INTEGER,
    "createdById" INTEGER,

    CONSTRAINT "BankLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnionLedger" (
    "id" SERIAL NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "LedgerTransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "referenceNo" TEXT,
    "description" TEXT,
    "balance" DECIMAL(12,2) NOT NULL,
    "relatedMemberId" INTEGER,
    "createdById" INTEGER,

    CONSTRAINT "UnionLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" INTEGER,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" INTEGER,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Campus_code_key" ON "Campus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Member_membershipNo_key" ON "Member"("membershipNo");

-- CreateIndex
CREATE UNIQUE INDEX "Member_employeeId_key" ON "Member"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_phone_key" ON "Member"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_key" ON "Member"("userId");

-- AddForeignKey
ALTER TABLE "SystemConfiguration" ADD CONSTRAINT "SystemConfiguration_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_loanTypeId_fkey" FOREIGN KEY ("loanTypeId") REFERENCES "LoanType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guarantor" ADD CONSTRAINT "Guarantor_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guarantor" ADD CONSTRAINT "Guarantor_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRepayment" ADD CONSTRAINT "LoanRepayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRepayment" ADD CONSTRAINT "LoanRepayment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollUpload" ADD CONSTRAINT "PayrollUpload_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "PayrollUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_matchedMemberId_fkey" FOREIGN KEY ("matchedMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankLedger" ADD CONSTRAINT "BankLedger_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionLedger" ADD CONSTRAINT "UnionLedger_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
