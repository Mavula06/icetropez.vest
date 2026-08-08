import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const depositSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  reference: z
    .string()
    .min(2, "Payment reference is required")
    .max(100, "Reference is too long"),
});

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

    const parsed = depositSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid deposit details.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { amount, reference } = parsed.data;

    if (amount < 100) {
      return NextResponse.json(
        { error: "Minimum deposit amount is R100.00." },
        { status: 400 },
      );
    }

    const deposit = await prisma.deposit.create({
      data: {
        userId: user.id,
        amount,
        reference: reference.trim(),
        status: "PENDING",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DEPOSIT_SUBMITTED",
        entity: "Deposit",
        entityId: deposit.id,
        description: `Deposit of R${amount.toFixed(2)} submitted for review.`,
      },
    });

    return NextResponse.json(
      {
        message: "Deposit submitted successfully.",
        deposit: {
          id: deposit.id,
          amount: deposit.amount,
          reference: deposit.reference,
          status: deposit.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Deposit creation error:", error);

    return NextResponse.json(
      { error: "Unable to submit deposit." },
      { status: 500 },
    );
  }
}
