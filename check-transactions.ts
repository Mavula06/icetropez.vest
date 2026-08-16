import "dotenv/config";
import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false,
  },
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: "internet@gmail.com",
    },
  });

  if (!user) {
    console.log("User not found.");
    return;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("\n========== TRANSACTIONS ==========\n");

  for (const tx of transactions) {
    console.log({
      id: tx.id,
      type: tx.type,
      status: tx.status,
      amount: tx.amount.toString(),
      description: tx.description,
      reference: tx.reference,
      createdAt: tx.createdAt,
    });
  }

  console.log("\n==================================");
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });