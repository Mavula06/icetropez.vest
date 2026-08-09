import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const bank = await prisma.companyBank.create({
    data: {
      companyName: "Icetropez.Vest",
      bankName: "YOUR BANK NAME",
      accountNumber: "YOUR ACCOUNT NUMBER",
      branchCode: "YOUR BRANCH CODE",
      accountType: "YOUR ACCOUNT TYPE",
      supportEmail: null,
      supportPhone: null,
      isActive: true,
    },
  });

  console.log("Company banking details created:");
  console.log(bank.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });