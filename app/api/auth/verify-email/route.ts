import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashToken } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "This verification link is invalid or has expired." },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerificationSentAt = undefined;
    await user.save();

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify email error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}