import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 },
      );
    }

    const bank = await prisma.companyBank.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        companyName: true,
        bankName: true,
        accountNumber: true,
        branchCode: true,
        accountType: true,
        supportEmail: true,
        supportPhone: true,
      },
    });

    if (!bank) {
      return NextResponse.json(
        { error: "Company banking details are not currently available." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      bank,
    });
  } catch (error) {
    console.error("Bank details error:", error);

    return NextResponse.json(
      { error: "Unable to load banking details." },
      { status: 500 },
    );
  }
}
