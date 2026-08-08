```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 },
      );
    }

    const wallet = await prisma.wallet.upsert({
      where: {
        userId: user.id,
      },
      update: {},
      create: {
        userId: user.id,
        balance: 0,
        availableBalance: 0,
      },
    });

    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      wallet: {
        balance: wallet.balance.toString(),
        availableBalance: wallet.availableBalance.toString(),
      },
      withdrawals: withdrawals.map((withdrawal) => ({
        id: withdrawal.id,
        amount: withdrawal.amount.toString(),
        bankName: withdrawal.bankName,
        accountName: withdrawal.accountName,
        accountNumber: withdrawal.accountNumber,
        branchCode: withdrawal.branchCode,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get withdrawals error:", error);

    return NextResponse.json(
      { error: "Unable to load withdrawals." },
      { status: 500 },
    );
  }
}

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

    const amount = Number(body.amount);
    const bankName = String(body.bankName ?? "").trim();
    const accountName = String(body.accountName ?? "").trim();
    const accountNumber = String(
      body.accountNumber ?? "",
    ).trim();
    const branchCode = String(body.branchCode ?? "").trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid withdrawal amount." },
        { status: 400 },
      );
    }

    if (amount < 100) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is R100.00." },
        { status: 400 },
      );
    }

    if (!bankName) {
      return NextResponse.json(
        { error: "Bank name is required." },
        { status: 400 },
      );
    }

    if (!accountName) {
      return NextResponse.json(
        { error: "Account holder name is required." },
        { status: 400 },
      );
    }

    if (!accountNumber) {
      return NextResponse.json(
        { error: "Account number is required." },
        { status: 400 },
      );
    }

    if (!branchCode) {
      return NextResponse.json(
        { error: "Branch code is required." },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!wallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      if (wallet.availableBalance.lt(amount)) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const pendingWithdrawal =
        await tx.withdrawal.findFirst({
          where: {
            userId: user.id,
            status: "PENDING",
          },
        });

      if (pendingWithdrawal) {
        throw new Error("PENDING_WITHDRAWAL_EXISTS");
      }

      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: user.id,
          amount,
          bankName,
          accountName,
          accountNumber,
          branchCode,
          status: "PENDING",
        },
      });

      const reference = `WDR-${withdrawal.id}`;

      await tx.transaction.create({
        data: {
          userId: user.id,
          walletId: wallet.id,
          type: "WITHDRAWAL",
          status: "PENDING",
          amount,
          description: "Withdrawal requested by investor.",
          reference,
        },
      });

      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          availableBalance: {
            decrement: amount,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "WITHDRAWAL_REQUESTED",
          entity: "Withdrawal",
          entityId: withdrawal.id,
          description: `Withdrawal request of R${amount.toFixed(
            2,
          )} submitted.`,
          metadata: {
            withdrawalId: withdrawal.id,
            amount,
            bankName,
            accountNumber,
          },
        },
      });

      return {
        withdrawal,
        wallet: updatedWallet,
      };
    });

    return NextResponse.json({
      message:
        "Withdrawal request submitted successfully.",
      withdrawal: {
        id: result.withdrawal.id,
        amount: result.withdrawal.amount.toString(),
        status: result.withdrawal.status,
        createdAt:
          result.withdrawal.createdAt.toISOString(),
      },
      wallet: {
        balance: result.wallet.balance.toString(),
        availableBalance:
          result.wallet.availableBalance.toString(),
      },
    });
  } catch (error) {
    console.error("Create withdrawal error:", error);

    if (error instanceof Error) {
      if (error.message === "WALLET_NOT_FOUND") {
        return NextResponse.json(
          { error: "Your wallet could not be found." },
          { status: 404 },
        );
      }

      if (error.message === "INSUFFICIENT_BALANCE") {
        return NextResponse.json(
          {
            error:
              "Insufficient available balance for this withdrawal.",
          },
          { status: 400 },
        );
      }

      if (
        error.message === "PENDING_WITHDRAWAL_EXISTS"
      ) {
        return NextResponse.json(
          {
            error:
              "You already have a pending withdrawal request. Please wait for it to be processed.",
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Unable to submit withdrawal request." },
      { status: 500 },
    );
  }
}
```
