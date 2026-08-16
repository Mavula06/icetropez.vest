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
  const email = "internet@gmail.com";

  const user = await prisma.user.findUnique({
    where: { email },
    include: { wallet: true },
  });

  if (!user) {
    throw new Error(`User ${email} was not found.`);
  }

  if (!user.wallet) {
    throw new Error(`Wallet for ${email} was not found.`);
  }

  console.log("Before reset:");
  console.log("Balance:", user.wallet.balance.toString());
  console.log("Available:", user.wallet.availableBalance.toString());

  const wallet = await prisma.wallet.update({
    where: {
      id: user.wallet.id,
    },
    data: {
      balance: 0,
      availableBalance: 0,
    },
  });

  console.log("");
  console.log("========== WALLET RESET ==========");
  console.log("User:", email);
  console.log("Balance:", wallet.balance.toString());
  console.log("Available Balance:", wallet.availableBalance.toString());
  console.log("==================================");
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });