import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyPassword, createSession } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    await connectDB();

    // password has `select: false` in the schema, so it must be requested explicitly
    const user = await User.findOne({ email }).select("+password");

    // Deliberately generic error message — don't reveal whether the email exists.
    const invalidCredentials = NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );

    if (!user) return invalidCredentials;

    const validPassword = await verifyPassword(password, user.password);
    if (!validPassword) return invalidCredentials;

    await createSession({
      userId: user._id.toString(),
      role: user.role,
      staffRole: user.staffRole,
    });

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
