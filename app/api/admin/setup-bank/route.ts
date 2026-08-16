import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
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

    // Deactivate any previous banking details.
    await prisma.companyBank.updateMany({
      data: {
        isActive: false,
      },
    });

    // Create the active company banking details.
    const bank = await prisma.companyBank.create({
      data: {
        companyName: "Icetropez.Vest",
        bankName: "Absa",
        accountNumber: "9391763831",
        branchCode: "632005",
        accountType: "Cheque",
        supportEmail: "help@icetropez.com",
        supportPhone: "",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      bank: {
        id: bank.id,
        companyName: bank.companyName,
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        branchCode: bank.branchCode,
        accountType: bank.accountType,
        supportEmail: bank.supportEmail,
        supportPhone: bank.supportPhone,
        isActive: bank.isActive,
      },
    });
  } catch (error) {
    console.error("Setup bank error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to configure banking details.",
      },
      { status: 500 },
    );
  }
}