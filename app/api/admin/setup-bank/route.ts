import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const bank = await prisma.companyBank.create({
      data: {
        companyName: "YOUR COMPANY NAME",
        bankName: "YOUR BANK NAME",
        accountNumber: "YOUR ACCOUNT NUMBER",
        branchCode: "YOUR BRANCH CODE",
        accountType: "Current Account",
        supportEmail: "YOUR SUPPORT EMAIL",
        supportPhone: "YOUR SUPPORT PHONE",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      bank,
    });
  } catch (error) {
    console.error("Setup bank error:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    );
  }
}
