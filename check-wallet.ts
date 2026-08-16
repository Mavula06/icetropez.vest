import { PrismaClient } from "./app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: "internetservee@gmail.com",
    },
    include: {
      wallet: true,
    },
  });

  if (!user) {
    console.log("USER NOT FOUND");
    return;
  }

  console.log("USER:");
  console.log({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  console.log("WALLET:");
  console.log(user.wallet);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
