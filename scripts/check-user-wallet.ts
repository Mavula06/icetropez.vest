import { prisma } from "../lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      wallet: {
        select: {
          id: true,
          balance: true,
          availableBalance: true,
        },
      },
      deposits: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          amount: true,
          status: true,
          reference: true,
          createdAt: true,
        },
      },
    },
  });

  for (const user of users) {
    console.log("\n==============================");
    console.log(`USER: ${user.firstName} ${user.lastName}`);
    console.log(`EMAIL: ${user.email}`);
    console.log(`USER ID: ${user.id}`);

    console.log("\nWALLET:");
    console.log(user.wallet);

    console.log("\nRECENT DEPOSITS:");
    console.table(user.deposits);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });