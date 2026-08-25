import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import { requireStaff } from "@/lib/auth";

export async function GET() {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean();

  return NextResponse.json({ inquiries });
}