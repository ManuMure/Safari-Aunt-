import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  generateToken,
  hashToken,
  VERIFICATION_TOKEN_TTL_MS,
  VERIFICATION_RESEND_COOLDOWN_MS,
} from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.userId).select("+emailVerificationSentAt");
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    if (
      user.emailVerificationSentAt &&
      Date.now() - user.emailVerificationSentAt.getTime() < VERIFICATION_RESEND_COOLDOWN_MS
    ) {
      return NextResponse.json(
        { error: "Please wait a moment before requesting another email." },
        { status: 429 }
      );
    }

    const verificationToken = generateToken();
    user.emailVerificationTokenHash = hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
    user.emailVerificationSentAt = new Date();
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);

    return NextResponse.json({ message: "Verification email sent" });
  } catch (err) {
    console.error("Resend verification error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}