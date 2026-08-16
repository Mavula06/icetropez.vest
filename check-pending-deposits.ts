import "dotenv/config";
import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const deposits = await prisma.deposit.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  console.log("\n========== PENDING DEPOSITS ==========\n");

  if (deposits.length === 0) {
    console.log("NO PENDING DEPOSITS");
  } else {
    for (const deposit of deposits) {
      console.log({
        id: deposit.id,
        user: deposit.user.email,
        name: `${deposit.user.firstName} ${deposit.user.lastName}`,
        amount: deposit.amount.toString(),
        status: deposit.status,
        reference: deposit.reference,
        createdAt: deposit.createdAt,
      });
    }
  }

  console.log(`\nTotal pending deposits: ${deposits.length}`);
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });