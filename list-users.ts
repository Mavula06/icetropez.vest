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

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      wallet: {
        select: {
          balance: true,
          availableBalance: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("\n================ USERS IN DATABASE ================\n");

  for (const user of users) {
    console.log({
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      balance: user.wallet?.balance?.toString() ?? "0.00",
      availableBalance:
        user.wallet?.availableBalance?.toString() ?? "0.00",
    });
  }

  console.log("\n====================================================");
  console.log(`Total users: ${users.length}`);
  console.log("====================================================\n");
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });