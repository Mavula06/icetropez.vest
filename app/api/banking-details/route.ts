import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const bank = await prisma.companyBank.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!bank) {
      return NextResponse.json(
        { error: "Banking details are currently unavailable." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      bank: {
        companyName: bank.companyName,
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        branchCode: bank.branchCode,
        accountType: bank.accountType,
        supportEmail: bank.supportEmail,
        supportPhone: bank.supportPhone,
      },
    });
  } catch (error) {
    console.error("Banking details error:", error);

    return NextResponse.json(
      { error: "Unable to load banking details." },
      { status: 500 },
    );
  }
}
