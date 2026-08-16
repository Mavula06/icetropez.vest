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
  const user = await prisma.user.findUnique({
    where: {
      email: "internet@gmail.com",
    },
    include: {
      wallet: true,
    },
  });

  if (!user) {
    console.log("USER NOT FOUND");
    return;
  }

  console.log("\n========== USER ==========");
  console.log("ID:", user.id);
  console.log("Email:", user.email);
  console.log("Name:", `${user.firstName} ${user.lastName}`);

  console.log("\n========== WALLET ==========");
  console.log(
    "Balance:",
    user.wallet?.balance?.toString() ?? "0.00",
  );
  console.log(
    "Available Balance:",
    user.wallet?.availableBalance?.toString() ?? "0.00",
  );
  console.log("============================\n");
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });