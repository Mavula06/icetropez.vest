import "dotenv/config";
import { prisma } from "./lib/prisma";

async function main() {
  const email = "internet@gmail.com";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error(`User ${email} was not found.`);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      role: "ADMIN",
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
    },
  });

  console.log("\n========== ADMIN UPDATED ==========");
  console.log(updated);
  console.log("===================================\n");
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
