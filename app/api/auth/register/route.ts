import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";


const registerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid registration details",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      referralCode,
    } = parsed.data;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    let referrerId: string | undefined;

    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: {
          referralCode,
        },
      });

      if (referrer) {
        referrerId = referrer.id;
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const generatedReferralCode =
      `${firstName}${lastName}${crypto.randomUUID().slice(0, 6)}`
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstName,
          lastName,
          email: normalizedEmail,
          phone,
          passwordHash,
          referralCode: generatedReferralCode,
          referredById: referrerId,
        },
      });

      await tx.wallet.create({
        data: {
          userId: newUser.id,
          balance: 0,
          availableBalance: 0,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: "USER_REGISTERED",
          entity: "User",
          entityId: newUser.id,
          description: "New user registered",
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          referralCode: user.referralCode,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Unable to create account." },
      { status: 500 }
    );
  }
}
