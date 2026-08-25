import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import "@/models/Tour";
import { requireStaff } from "@/lib/auth";

interface RouteParams {
  params: { id: string };
}

const BookingUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  amountPaid: z.number().min(0).optional(),
  addNote: z.string().min(1).optional(),
});

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const booking = await Booking.findById(params.id).populate("tour", "name").lean();

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  return NextResponse.json({ booking });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = BookingUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (
      data.status === undefined &&
      data.amountPaid === undefined &&
      data.addNote === undefined
    ) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await connectDB();

    const existing = await Booking.findById(params.id);
    if (!existing) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    if (data.amountPaid !== undefined && data.amountPaid > existing.totalAmount) {
      return NextResponse.json(
        { error: "Amount paid can't exceed the total booking amount" },
        { status: 400 }
      );
    }

    const updateOps: Record<string, unknown> = {};
    const setFields: Record<string, unknown> = {};
    if (data.status !== undefined) setFields.status = data.status;
    if (data.amountPaid !== undefined) setFields.amountPaid = data.amountPaid;
    if (Object.keys(setFields).length) updateOps.$set = setFields;
    if (data.addNote) updateOps.$push = { internalNotes: data.addNote };

    const booking = await Booking.findByIdAndUpdate(params.id, updateOps, {
      new: true,
    }).populate("tour", "name");

    return NextResponse.json({ booking });
  } catch (err) {
    console.error("Update booking error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}