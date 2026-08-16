import "dotenv/config";
import { prisma } from "../lib/prisma";

const plans = [
  {
    name: "ICETROPEZ PLAN-A",
    minimumAmount: "180.00",
    dailyAmount: "30.00",
    dayAmount: "150.00",
    totalAmount: "4500.00",
    durationDays: 25,
    returnRate: "0",
    description: "Starter investment plan",
  },
  {
    name: "ICETROPEZ PLAN-B",
    minimumAmount: "580.00",
    dailyAmount: "100.00",
    dayAmount: "150.00",
    totalAmount: "15000.00",
    durationDays: 25,
    returnRate: "0",
    description: "Growth investment plan",
  },
  {
    name: "ICETROPEZ PLAN-C",
    minimumAmount: "1800.00",
    dailyAmount: "410.00",
    dayAmount: "150.00",
    totalAmount: "61500.00",
    durationDays: 25,
    returnRate: "0",
    description: "Advanced investment plan",
  },
  {
    name: "ICETROPEZ PLAN-D",
    minimumAmount: "4400.00",
    dailyAmount: "1100.00",
    dayAmount: "150.00",
    totalAmount: "16500.00",
    durationDays: 25,
    returnRate: "0",
    description: "Premium investment plan",
  },
  {
    name: "ICETROPEZ PLAN-E",
    minimumAmount: "98000.00",
    dailyAmount: "2659.00",
    dayAmount: "150.00",
    totalAmount: "397500.00",
    durationDays: 25,
    returnRate: "0",
    description: "Elite investment plan",
  },
];

async function main() {
  console.log("Updating Icetropez.Vest investment plans...\n");

  for (const plan of plans) {
    const existing = await prisma.investmentPlan.findFirst({
      where: {
        name: plan.name,
      },
    });

    const data = {
      name: plan.name,
      description: plan.description,
      minimumAmount: plan.minimumAmount,
      dailyAmount: plan.dailyAmount,
      dayAmount: plan.dayAmount,
      totalAmount: plan.totalAmount,
      durationDays: plan.durationDays,
      returnRate: plan.returnRate,
      isActive: true,
    };

    if (existing) {
      await prisma.investmentPlan.update({
        where: {
          id: existing.id,
        },
        data,
      });

      console.log(`UPDATED: ${plan.name}`);
    } else {
      await prisma.investmentPlan.create({
        data,
      });

      console.log(`CREATED: ${plan.name}`);
    }
  }

  console.log("\nAll investment plans updated successfully.");
}

main()
  .catch((error) => {
    console.error("\nInvestment plan update failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });