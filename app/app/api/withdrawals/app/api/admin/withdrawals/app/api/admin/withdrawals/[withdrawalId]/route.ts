```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { getCurrentUser } = await import(
      "@/lib/auth"
    );

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
      const withdrawal =
        await tx.withdrawal.findUnique({
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
        throw new Error(
          "WITHDRAWAL_ALREADY_PROCESSED",
        );
      }

      const wallet = await tx.wallet.findUnique({
        where: {
          userId: withdrawal.userId,
        },
      });

      if (!wallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      const transaction =
        await tx.transaction.findFirst({
          where: {
            userId: withdrawal.userId,
            type: "WITHDRAWAL",
            amount: withdrawal.amount,
            status: "PENDING",
            createdAt: {
              gte: withdrawal.createdAt,
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        });

      if (action === "APPROVE") {
        const updatedWithdrawal =
          await tx.withdrawal.update({
            where: {
              id: withdrawal.id,
            },
            data: {
              status: "COMPLETED",
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
            description: `Withdrawal of R${withdrawal.amount.toString()} approved for ${withdrawal.user.email}.`,
            metadata: {
              withdrawalId: withdrawal.id,
              customerId: withdrawal.userId,
              amount: withdrawal.amount.toString(),
              bankName: withdrawal.bankName,
              accountNumber:
                withdrawal.accountNumber,
            },
          },
        });

        return {
          action,
          withdrawal: updatedWithdrawal,
          wallet,
        };
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

      const updatedWallet = await tx.wallet.update({
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
          description: `Withdrawal of R${withdrawal.amount.toString()} rejected for ${withdrawal.user.email}.`,
          metadata: {
            withdrawalId: withdrawal.id,
            customerId: withdrawal.userId,
            amount: withdrawal.amount.toString(),
          },
        },
      });

      return {
        action,
        withdrawal: updatedWithdrawal,
        wallet: updatedWallet,
      };
    });

    return NextResponse.json({
      message:
        result.action === "APPROVE"
          ? "Withdrawal approved successfully."
          : "Withdrawal rejected successfully.",

      withdrawal: {
        id: result.withdrawal.id,
        amount: result.withdrawal.amount.toString(),
        status: result.withdrawal.status,
      },

      wallet: {
        balance: result.wallet.balance.toString(),
        availableBalance:
          result.wallet.availableBalance.toString(),
      },
    });
  } catch (error) {
    console.error(
      "Admin withdrawal processing error:",
      error,
    );

    if (error instanceof Error) {
      if (error.message === "WITHDRAWAL_NOT_FOUND") {
        return NextResponse.json(
          { error: "Withdrawal not found." },
          { status: 404 },
        );
      }

      if (
        error.message ===
        "WITHDRAWAL_ALREADY_PROCESSED"
      ) {
        return NextResponse.json(
          {
            error:
              "This withdrawal has already been processed.",
          },
          { status: 409 },
        );
      }

      if (error.message === "WALLET_NOT_FOUND") {
        return NextResponse.json(
          {
            error:
              "The investor wallet could not be found.",
          },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Unable to process withdrawal request.",
      },
      { status: 500 },
    );
  }
}
```
