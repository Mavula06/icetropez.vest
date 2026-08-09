import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const accountNumber = process.env.COMPANY_BANK_ACCOUNT_NUMBER;

  if (!accountNumber) {
    throw new Error(
      "COMPANY_BANK_ACCOUNT_NUMBER is not configured"
    );
  }

  const bank = await prisma.companyBank.create({
    data: {
      companyName: "icetropez.vest",
      bankName: "ABSA",
      accountNumber,
      branchCode: "632005",
      accountType: "Cheque",
      supportEmail: "help@icetropez.net",
      supportPhone: "0833949936",
      isActive: true,
    },
  });

  console.log("Company banking details created:");
  console.log({
    id: bank.id,
    companyName: bank.companyName,
    bankName: bank.bankName,
    accountType: bank.accountType,
    branchCode: bank.branchCode,
    supportEmail: bank.supportEmail,
    supportPhone: bank.supportPhone,
    isActive: bank.isActive,
  });
}

main()
  .catch((error) => {
    console.error("Failed to create company banking details:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
