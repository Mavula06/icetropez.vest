import "dotenv/config";
import { randomUUID } from "crypto";
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

const EMAIL = "internet@gmail.com";
const CREDIT_AMOUNT = 100;

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: EMAIL,
    },
    include: {
      wallet: true,
    },
  });

  if (!user) {
    throw new Error(`User ${EMAIL} was not found.`);
  }

  console.log("\nUser found:");
  console.log("Name:", `${user.firstName} ${user.lastName}`);
  console.log("Email:", user.email);
  console.log("User ID:", user.id);

  if (!user.wallet) {
    console.log("Wallet does not exist. Creating wallet...");

    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: CREDIT_AMOUNT,
        availableBalance: CREDIT_AMOUNT,
      },
    });
  } else {
    console.log(
      "Current balance:",
      user.wallet.balance.toString(),
    );

    console.log(
      "Current available balance:",
      user.wallet.availableBalance.toString(),
    );

    await prisma.wallet.update({
      where: {
        id: user.wallet.id,
      },
      data: {
        balance: {
          increment: CREDIT_AMOUNT,
        },
        availableBalance: {
          increment: CREDIT_AMOUNT,
        },
      },
    });
  }

  const wallet = await prisma.wallet.findUnique({
    where: {
      userId: user.id,
    },
  });

  const reference = `ADMIN-CREDIT-${randomUUID()}`;

  await prisma.transaction.create({
    data: {
      userId: user.id,
      walletId: wallet!.id,
      type: "DEPOSIT",
      status: "COMPLETED",
      amount: CREDIT_AMOUNT,
      reference,
      description: "Admin test wallet credit",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "ADMIN_WALLET_CREDIT",
      entity: "Wallet",
      entityId: wallet!.id,
      description: `Admin credited wallet with R${CREDIT_AMOUNT.toFixed(2)}.`,
      metadata: {
        amount: CREDIT_AMOUNT,
        reference,
        email: user.email,
      },
    },
  });

  console.log("\n======================================");
  console.log("       WALLET CREDIT SUCCESSFUL");
  console.log("======================================");
  console.log("Email:", user.email);
  console.log("Amount credited: R100.00");
  console.log("--------------------------------------");
  console.log(
    "Balance:",
    wallet?.balance.toString(),
  );
  console.log(
    "Available Balance:",
    wallet?.availableBalance.toString(),
  );
  console.log("--------------------------------------");
  console.log("Transaction reference:", reference);
  console.log("======================================\n");
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });