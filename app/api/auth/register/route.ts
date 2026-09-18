import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword, createSession } from "@/lib/auth";
import { generateToken, hashToken, VERIFICATION_TOKEN_TTL_MS } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = generateToken();

    const user = await User.create({
      name,
      email,
      password: passwordHash,
      phone,
      role: "customer",
      emailVerificationTokenHash: hashToken(verificationToken),
      emailVerificationExpires: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
      emailVerificationSentAt: new Date(),
    });

    await createSession({ userId: user._id.toString(), role: "customer" });

    // Don't fail signup if the email provider hiccups — they can request
    // a new link from their account page.
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailErr) {
      console.error("Failed to send verification email on register:", emailErr);
    }

    return NextResponse.json(
      { id: user._id, name: user.name, email: user.email },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}