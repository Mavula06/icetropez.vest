import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    depositId: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 },
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 },
      );
    }

    const { depositId } = await context.params;

    const result = await prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.findUnique({
        where: {
          id: depositId,
        },
        include: {
          user: true,
        },
      });

      if (!deposit) {
        throw new Error("DEPOSIT_NOT_FOUND");
      }

      if (deposit.status !== "PENDING") {
        throw new Error("DEPOSIT_ALREADY_PROCESSED");
      }

      const wallet = await tx.wallet.upsert({
        where: {
          userId: deposit.userId,
        },
        update: {},
        create: {
          userId: deposit.userId,
          balance: 0,
          availableBalance: 0,
        },
      });

      const updatedDeposit = await tx.deposit.update({
        where: {
          id: deposit.id,
        },
        data: {
          status: "COMPLETED",
        },
      });

      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            increment: deposit.amount,
          },
          availableBalance: {
            increment: deposit.amount,
          },
        },
      });

      await tx.transaction.create({
        data: {
          userId: deposit.userId,
          walletId: wallet.id,
          type: "DEPOSIT",
          status: "COMPLETED",
          amount: deposit.amount,
          description: "Deposit approved by admin.",
          reference:
            deposit.reference ?? `DEP-${deposit.id}`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "DEPOSIT_APPROVED",
          entity: "Deposit",
          entityId: deposit.id,
          description:
            `Deposit of R${deposit.amount.toString()} approved for ${deposit.user.email}.`,
          metadata: {
            depositId: deposit.id,
            customerId: deposit.userId,
          },
        },
      });

      return {
        deposit: updatedDeposit,
        wallet: updatedWallet,
      };
    });

    return NextResponse.json({
      message: "Deposit approved successfully.",
      deposit: {
        id: result.deposit.id,
        amount: result.deposit.amount.toString(),
        status: result.deposit.status,
      },
      wallet: {
        balance: result.wallet.balance.toString(),
        availableBalance:
          result.wallet.availableBalance.toString(),
      },
    });
  } catch (error) {
    console.error("Deposit approval error:", error);

    if (error instanceof Error) {
      if (error.message === "DEPOSIT_NOT_FOUND") {
        return NextResponse.json(
          { error: "Deposit not found." },
          { status: 404 },
        );
      }

      if (error.message === "DEPOSIT_ALREADY_PROCESSED") {
        return NextResponse.json(
          {
            error: "This deposit has already been processed.",
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Unable to approve deposit." },
      { status: 500 },
    );
  }
}