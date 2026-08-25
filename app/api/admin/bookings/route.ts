import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import "@/models/Tour";
import { requireStaff } from "@/lib/auth";

export async function GET() {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const bookings = await Booking.find()
    .populate("tour", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ bookings });
}