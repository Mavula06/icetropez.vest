import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    depositId: string;
  }>;
};

export async function PATCH(
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
        { error: "Administrator access required." },
        { status: 403 },
      );
    }

    const { depositId } = await context.params;

    const body = await request.json();

    const action = body.action;

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json(
        {
          error:
            "Invalid action. Use APPROVE or REJECT.",
        },
        { status: 400 },
      );
    }

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

      if (action === "REJECT") {
        const rejected = await tx.deposit.update({
          where: {
            id: deposit.id,
          },
          data: {
            status: "REJECTED",
          },
        });

        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "DEPOSIT_REJECTED",
            entity: "Deposit",
            entityId: deposit.id,
            description: `Deposit of R${Number(
              deposit.amount,
            ).toFixed(2)} rejected for ${deposit.user.email}.`,
            metadata: {
              depositId: deposit.id,
              affectedUserId: deposit.userId,
            },
          },
        });

        return {
          deposit: rejected,
          wallet: null,
        };
      }

      let wallet = await tx.wallet.findUnique({
        where: {
          userId: deposit.userId,
        },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: deposit.userId,
            balance: deposit.amount,
            availableBalance: deposit.amount,
          },
        });
      } else {
        wallet = await tx.wallet.update({
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
      }

      const completedDeposit = await tx.deposit.update({
        where: {
          id: deposit.id,
        },
        data: {
          status: "COMPLETED",
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId: deposit.userId,
          walletId: wallet.id,
          type: "DEPOSIT",
          status: "COMPLETED",
          amount: deposit.amount,
          reference: `DEP-${deposit.id}`,
          description: `Verified deposit from ${deposit.user.email}.`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "DEPOSIT_APPROVED",
          entity: "Deposit",
          entityId: deposit.id,
          description: `Deposit of R${Number(
            deposit.amount,
          ).toFixed(2)} approved and credited to ${deposit.user.email}.`,
          metadata: {
            depositId: deposit.id,
            affectedUserId: deposit.userId,
            walletId: wallet.id,
            transactionId: transaction.id,
          },
        },
      });

      return {
        deposit: completedDeposit,
        wallet,
      };
    });

    if (action === "REJECT") {
      return NextResponse.json({
        message: "Deposit rejected successfully.",
        deposit: result.deposit,
      });
    }

    return NextResponse.json({
      message:
        "Deposit approved and wallet credited successfully.",
      deposit: result.deposit,
      wallet: result.wallet,
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
            error:
              "This deposit has already been processed.",
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Unable to process deposit." },
      { status: 500 },
    );
  }
}
