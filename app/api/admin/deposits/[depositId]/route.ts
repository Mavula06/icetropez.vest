import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
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
          error: 'Action must be either "APPROVE" or "REJECT".',
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

      /*
       * =========================
       * REJECT DEPOSIT
       * =========================
       */
      if (action === "REJECT") {
        const rejectedDeposit = await tx.deposit.update({
          where: {
            id: deposit.id,
          },
          data: {
            status: "CANCELLED",
          },
        });

        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "DEPOSIT_REJECTED",
            entity: "Deposit",
            entityId: deposit.id,
            description: `Deposit of R${deposit.amount.toString()} rejected for ${deposit.user.email}.`,
            metadata: {
              depositId: deposit.id,
              customerId: deposit.userId,
              paymentReference: deposit.reference,
            },
          },
        });

        return {
          action: "REJECT" as const,
          deposit: rejectedDeposit,
          wallet: null,
        };
      }

      /*
       * =========================
       * APPROVE DEPOSIT
       * =========================
       */

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

      /*
       * Mark the deposit as completed.
       */
      const updatedDeposit = await tx.deposit.update({
        where: {
          id: deposit.id,
        },
        data: {
          status: "COMPLETED",
        },
      });

      /*
       * Credit the user's wallet.
       */
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

      /*
       * IMPORTANT:
       *
       * Transaction.reference is UNIQUE in the database.
       * Therefore we generate a unique internal transaction
       * reference instead of using the customer's EFT reference.
       */
      const transactionReference = `DEP-${randomUUID()}`;

      const transaction = await tx.transaction.create({
        data: {
          userId: deposit.userId,
          walletId: wallet.id,
          type: "DEPOSIT",
          status: "COMPLETED",
          amount: deposit.amount,
          description: deposit.reference
            ? `EFT deposit approved. Payment reference: ${deposit.reference}`
            : "EFT deposit approved by admin.",
          reference: transactionReference,
        },
      });

      /*
       * Audit the approval.
       */
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "DEPOSIT_APPROVED",
          entity: "Deposit",
          entityId: deposit.id,
          description: `Deposit of R${deposit.amount.toString()} approved for ${deposit.user.email}.`,
          metadata: {
            depositId: deposit.id,
            customerId: deposit.userId,
            paymentReference: deposit.reference,
            transactionId: transaction.id,
            transactionReference,
            amount: deposit.amount.toString(),
          },
        },
      });

      return {
        action: "APPROVE" as const,
        deposit: updatedDeposit,
        wallet: updatedWallet,
        transaction,
      };
    });

    /*
     * =========================
     * RESPONSE
     * =========================
     */

    if (result.action === "REJECT") {
      return NextResponse.json({
        message: "Deposit rejected successfully.",
        deposit: {
          id: result.deposit.id,
          amount: result.deposit.amount.toString(),
          status: result.deposit.status,
        },
      });
    }

    return NextResponse.json({
      message: "Deposit approved successfully.",
      deposit: {
        id: result.deposit.id,
        amount: result.deposit.amount.toString(),
        status: result.deposit.status,
      },
      wallet: {
        balance: result.wallet!.balance.toString(),
        availableBalance:
          result.wallet!.availableBalance.toString(),
      },
      transaction: {
        id: result.transaction.id,
        reference: result.transaction.reference,
        amount: result.transaction.amount.toString(),
        status: result.transaction.status,
      },
    });
  } catch (error) {
    console.error("Deposit processing error:", error);

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

      /*
       * Return the actual Prisma error during development.
       * This makes future database problems much easier to diagnose.
       */
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json(
          {
            error: "Unable to process deposit.",
            details: error.message,
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { error: "Unable to process deposit." },
      { status: 500 },
    );
  }
}