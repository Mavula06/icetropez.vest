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
  const deposits = await prisma.deposit.findMany({
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("\n========== ALL DEPOSITS ==========\n");

  for (const deposit of deposits) {
    console.log({
      id: deposit.id,
      email: deposit.user.email,
      name: `${deposit.user.firstName} ${deposit.user.lastName}`,
      amount: deposit.amount.toString(),
      status: deposit.status,
      reference: deposit.reference,
      createdAt: deposit.createdAt,
    });
  }

  console.log(`\nTotal deposits: ${deposits.length}`);
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });