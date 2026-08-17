import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function calculateDaysElapsed(
  startDate: Date,
  endDate: Date,
) {
  const now = new Date();

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now <= start) {
    return 0;
  }

  const elapsedMilliseconds =
    now.getTime() - start.getTime();

  let days = Math.floor(
    elapsedMilliseconds /
      (1000 * 60 * 60 * 24),
  );

  const maximumDays = Math.max(
    0,
    Math.ceil(
      (end.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  days = Math.max(
    0,
    Math.min(days, maximumDays),
  );

  return days;
}

function roundMoney(value: number) {
  return Math.round(
    (value + Number.EPSILON) * 100,
  ) / 100;
}

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        {
          status: 401,
        },
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const investments =
            await tx.investment.findMany({
              where: {
                userId: user.id,
              },
              include: {
                plan: true,
              },
              orderBy: {
                createdAt: "asc",
              },
            });

          const wallet =
            await tx.wallet.findUnique({
              where: {
                userId: user.id,
              },
            });

          if (!wallet) {
            throw new Error(
              "Wallet not found.",
            );
          }

          let totalNewEarnings = 0;

          const updatedInvestments = [];

          for (const investment of investments) {
            const amount = Number(
              investment.amount,
            );

            const finalPayout = Number(
              investment.plan.totalAmount,
            );

            const durationDays =
              investment.plan.durationDays;

            if (
              amount <= 0 ||
              finalPayout <= amount ||
              durationDays <= 0
            ) {
              continue;
            }

            /*
             * Total profit is the final payout
             * minus the original investment.
             */
            const totalProfit =
              finalPayout - amount;

            /*
             * Daily profit is derived from the
             * actual final payout.
             */
            const dailyEarning =
              totalProfit / durationDays;

            /*
             * Work out how many complete
             * investment days have elapsed.
             */
            const daysElapsed =
              calculateDaysElapsed(
                investment.startDate,
                investment.endDate,
              );

            /*
             * The maximum amount that should
             * have been earned by this point.
             */
            const expectedEarned =
              roundMoney(
                Math.min(
                  totalProfit,
                  dailyEarning *
                    daysElapsed,
                ),
              );

            const alreadyEarned =
              roundMoney(
                Number(
                  investment.earnedAmount,
                ),
              );

            /*
             * Only credit the difference.
             *
             * This makes the operation idempotent.
             * Refreshing the page cannot repeatedly
             * credit the same earnings.
             */
            const newEarnings =
              roundMoney(
                Math.max(
                  expectedEarned -
                    alreadyEarned,
                  0,
                ),
              );

            if (newEarnings > 0) {
              await tx.investment.update({
                where: {
                  id: investment.id,
                },
                data: {
                  earnedAmount:
                    expectedEarned,
                  isActive:
                    daysElapsed <
                    durationDays,
                },
              });

              await tx.wallet.update({
                where: {
                  id: wallet.id,
                },
                data: {
                  balance: {
                    increment:
                      newEarnings,
                  },
                  availableBalance: {
                    increment:
                      newEarnings,
                  },
                },
              });

              await tx.transaction.create({
                data: {
                  userId: user.id,
                  walletId: wallet.id,
                  type:
                    "INVESTMENT_RETURN",
                  status: "COMPLETED",
                  amount:
                    newEarnings,
                  description:
                    `Investment earnings - ${investment.plan.name} - Day ${daysElapsed}`,
                  reference:
                    `INVESTMENT-EARNING-${investment.id}-${daysElapsed}`,
                },
              });

              totalNewEarnings =
                roundMoney(
                  totalNewEarnings +
                    newEarnings,
                );
            } else {
              /*
               * Keep the active/completed state
               * correct even when no new money
               * needs to be credited.
               */
              await tx.investment.update({
                where: {
                  id: investment.id,
                },
                data: {
                  isActive:
                    daysElapsed <
                    durationDays,
                },
              });
            }

            updatedInvestments.push({
              id: investment.id,
              plan: investment.plan.name,
              amount,
              finalPayout,
              totalProfit,
              dailyEarning:
                roundMoney(
                  dailyEarning,
                ),
              daysElapsed,
              earnedAmount:
                expectedEarned,
              currentValue:
                roundMoney(
                  amount +
                    expectedEarned,
                ),
              completed:
                daysElapsed >=
                durationDays,
            });
          }

          const updatedWallet =
            await tx.wallet.findUnique({
              where: {
                id: wallet.id,
              },
            });

          return {
            totalNewEarnings,
            walletBalance:
              Number(
                updatedWallet?.balance ??
                  0,
              ),
            availableBalance:
              Number(
                updatedWallet
                  ?.availableBalance ??
                  0,
              ),
            investments:
              updatedInvestments,
          };
        },
        {
          isolationLevel:
            "Serializable",
        },
      );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "Synchronize investment earnings error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to synchronize investment earnings.",
      },
      {
        status: 500,
      },
    );
  }
}