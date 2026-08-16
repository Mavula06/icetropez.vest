import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const investmentSchema = z.object({
  planId: z.string().min(1, "Investment plan is required."),
  amount: z.coerce
    .number()
    .positive("Investment amount must be greater than zero."),
});

/**
 * GET /api/investments
 *
 * Returns all active investment plans.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 },
      );
    }

    const plans = await prisma.investmentPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        minimumAmount: "asc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        minimumAmount: true,
        dailyAmount: true,
        dayAmount: true,
        totalAmount: true,
        returnRate: true,
        durationDays: true,
      },
    });

    return NextResponse.json({
      plans,
    });
  } catch (error) {
    console.error("Investment plans error:", error);

    return NextResponse.json(
      { error: "Unable to load investment plans." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/investments
 *
 * Creates an investment using the user's available wallet balance.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const parsed = investmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid investment details.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { planId, amount } = parsed.data;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Investment amount must be greater than zero." },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      /*
       * Always load the plan from the database.
       * Never trust plan values supplied by the browser.
       */
      const plan = await tx.investmentPlan.findFirst({
        where: {
          id: planId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          minimumAmount: true,
          dailyAmount: true,
          dayAmount: true,
          totalAmount: true,
          returnRate: true,
          durationDays: true,
        },
      });

      if (!plan) {
        throw new Error("INVESTMENT_PLAN_NOT_FOUND");
      }

      const minimumAmount = Number(plan.minimumAmount);
      const dailyAmount = Number(plan.dailyAmount);
      const dayAmount = Number(plan.dayAmount);
      const totalAmount = Number(plan.totalAmount);
      const returnRate = Number(plan.returnRate);
      const durationDays = plan.durationDays;

      if (amount < minimumAmount) {
        throw new Error("INVESTMENT_BELOW_MINIMUM");
      }

      const wallet = await tx.wallet.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!wallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      const availableBalance = Number(wallet.availableBalance);

      if (availableBalance < amount) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const startDate = new Date();

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);

      /*
       * Investment only stores fields that actually exist
       * on the production Investment table.
       *
       * Plan values are obtained through the InvestmentPlan relation.
       */
      const investment = await tx.investment.create({
        data: {
          userId: user.id,
          planId: plan.id,
          amount,
          startDate,
          endDate,
          earnedAmount: 0,
          isActive: true,
        },
        include: {
          plan: {
            select: {
              id: true,
              name: true,
              description: true,
              minimumAmount: true,
              dailyAmount: true,
              dayAmount: true,
              totalAmount: true,
              returnRate: true,
              durationDays: true,
            },
          },
        },
      });

      /*
       * Deduct only the amount actually invested.
       */
      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            decrement: amount,
          },
          availableBalance: {
            decrement: amount,
          },
        },
      });

      const reference = `INV-${randomUUID()}`;

      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          walletId: wallet.id,
          type: "INVESTMENT",
          status: "COMPLETED",
          amount,
          reference,
          description: `Investment in ${plan.name}`,
        },
      });

      /*
       * Store the plan values used when the investment was created
       * in the audit log.
       */
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "INVESTMENT_CREATED",
          entity: "Investment",
          entityId: investment.id,
          description: `Investment of R${amount.toFixed(2)} created in ${plan.name}.`,
          metadata: {
            investmentId: investment.id,
            planId: plan.id,
            investmentAmount: amount,
            minimumAmount,
            dailyAmount,
            dayAmount,
            totalAmount,
            returnRate,
            durationDays,
            transactionId: transaction.id,
          },
        },
      });

      return {
        investment,
        wallet: updatedWallet,
        transaction,

        planValues: {
          minimumAmount,
          dailyAmount,
          dayAmount,
          totalAmount,
          returnRate,
          durationDays,
        },
      };
    });

    return NextResponse.json(
      {
        message:
          "Investment created successfully. Your wallet balance has been updated.",

        investment: {
          id: result.investment.id,
          amount: result.investment.amount,
          startDate: result.investment.startDate,
          endDate: result.investment.endDate,
          earnedAmount: result.investment.earnedAmount,
          isActive: result.investment.isActive,

          /*
           * These values belong to the investment plan,
           * not the Investment record itself.
           */
          plan: result.investment.plan,

          values: result.planValues,
        },

        wallet: {
          balance: result.wallet.balance,
          availableBalance: result.wallet.availableBalance,
        },

        transaction: {
          id: result.transaction.id,
          reference: result.transaction.reference,
          amount: result.transaction.amount,
          status: result.transaction.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Investment creation error:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "INVESTMENT_PLAN_NOT_FOUND":
          return NextResponse.json(
            {
              error: "The selected investment plan is not available.",
            },
            { status: 404 },
          );

        case "INVESTMENT_BELOW_MINIMUM":
          return NextResponse.json(
            {
              error: "The investment amount is below the plan minimum.",
            },
            { status: 400 },
          );

        case "WALLET_NOT_FOUND":
          return NextResponse.json(
            {
              error:
                "Your wallet could not be found. Please contact support.",
            },
            { status: 400 },
          );

        case "INSUFFICIENT_BALANCE":
          return NextResponse.json(
            {
              error:
                "Insufficient available wallet balance for this investment.",
            },
            { status: 400 },
          );
      }
    }

    return NextResponse.json(
      { error: "Unable to create investment." },
      { status: 500 },
    );
  }
}