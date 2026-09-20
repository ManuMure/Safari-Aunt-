import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireCustomer } from "@/lib/auth";

const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  phone: z.string().optional(),
  country: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireCustomer();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = ProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.userId,
      {
        name: parsed.data.name,
        phone: parsed.data.phone || undefined,
        country: parsed.data.country || undefined,
      },
      { new: true }
    ).select("name email phone country");

    if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    return NextResponse.json({
      name: user.name,
      phone: user.phone,
      country: user.country,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}