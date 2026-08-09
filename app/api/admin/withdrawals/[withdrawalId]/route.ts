import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    withdrawalId: string;
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

    const { withdrawalId } = await context.params;

    const body = await request.json();

    const action = String(body.action ?? "")
      .trim()
      .toUpperCase();

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json(
        {
          error:
            'Action must be either "APPROVE" or "REJECT".',
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({
        where: {
          id: withdrawalId,
        },
        include: {
          user: true,
        },
      });

      if (!withdrawal) {
        throw new Error("WITHDRAWAL_NOT_FOUND");
      }

      if (withdrawal.status !== "PENDING") {
        throw new Error("WITHDRAWAL_ALREADY_PROCESSED");
      }

      const wallet = await tx.wallet.findUnique({
        where: {
          userId: withdrawal.userId,
        },
      });

      if (!wallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      const transaction = await tx.transaction.findFirst({
        where: {
          userId: withdrawal.userId,
          walletId: wallet.id,
          type: "WITHDRAWAL",
          amount: withdrawal.amount,
          status: "PENDING",
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (action === "APPROVE") {
        if (wallet.balance.lt(withdrawal.amount)) {
          throw new Error("INSUFFICIENT_WALLET_BALANCE");
        }

        const updatedWithdrawal =
          await tx.withdrawal.update({
            where: {
              id: withdrawal.id,
            },
            data: {
              status: "COMPLETED",
            },
          });

        await tx.wallet.update({
          where: {
            id: wallet.id,
          },
          data: {
            balance: {
              decrement: withdrawal.amount,
            },
          },
        });

        if (transaction) {
          await tx.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              status: "COMPLETED",
              description:
                "Withdrawal approved and processed by admin.",
            },
          });
        }

        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "WITHDRAWAL_APPROVED",
            entity: "Withdrawal",
            entityId: withdrawal.id,
            description:
              `Withdrawal of R${withdrawal.amount.toString()} approved for ${withdrawal.user.email}.`,
            metadata: {
              withdrawalId: withdrawal.id,
              customerId: withdrawal.userId,
              amount: withdrawal.amount.toString(),
            },
          },
        });

        return updatedWithdrawal;
      }

      const updatedWithdrawal =
        await tx.withdrawal.update({
          where: {
            id: withdrawal.id,
          },
          data: {
            status: "CANCELLED",
          },
        });

      await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          availableBalance: {
            increment: withdrawal.amount,
          },
        },
      });

      if (transaction) {
        await tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: "CANCELLED",
            description:
              "Withdrawal rejected by admin. Funds returned to available balance.",
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "WITHDRAWAL_REJECTED",
          entity: "Withdrawal",
          entityId: withdrawal.id,
          description:
            `Withdrawal of R${withdrawal.amount.toString()} rejected for ${withdrawal.user.email}.`,
          metadata: {
            withdrawalId: withdrawal.id,
            customerId: withdrawal.userId,
            amount: withdrawal.amount.toString(),
          },
        },
      });

      return updatedWithdrawal;
    });

    return NextResponse.json({
      success: true,
      message:
        action === "APPROVE"
          ? "Withdrawal approved successfully."
          : "Withdrawal rejected and funds returned to the investor.",
      withdrawal: {
        id: result.id,
        amount: result.amount.toString(),
        status: result.status,
        updatedAt: result.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Process withdrawal error:", error);

    if (error instanceof Error) {
      if (error.message === "WITHDRAWAL_NOT_FOUND") {
        return NextResponse.json(
          { error: "Withdrawal not found." },
          { status: 404 },
        );
      }

      if (error.message === "WITHDRAWAL_ALREADY_PROCESSED") {
        return NextResponse.json(
          {
            error:
              "This withdrawal has already been processed.",
          },
          { status: 400 },
        );
      }

      if (error.message === "WALLET_NOT_FOUND") {
        return NextResponse.json(
          { error: "Investor wallet not found." },
          { status: 400 },
        );
      }

      if (error.message === "INSUFFICIENT_WALLET_BALANCE") {
        return NextResponse.json(
          {
            error:
              "The investor wallet does not have enough balance to process this withdrawal.",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Unable to process withdrawal." },
      { status: 500 },
    );
  }
}