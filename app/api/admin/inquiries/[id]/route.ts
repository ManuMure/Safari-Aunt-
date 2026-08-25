import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import { requireStaff } from "@/lib/auth";

interface RouteParams {
  params: { id: string };
}

const UpdateSchema = z.object({
  status: z.enum(["new", "read", "responded"]),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();
    const inquiry = await Inquiry.findByIdAndUpdate(
      params.id,
      { status: parsed.data.status },
      { new: true }
    );

    if (!inquiry) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    return NextResponse.json({ inquiry });
  } catch (err) {
    console.error("Update inquiry error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}