import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import Booking from "@/models/Booking";
import { getSession } from "@/lib/auth";

const BookingSchema = z.object({
  tourSlug: z.string().min(1),
  travelDate: z.string().min(1, "Travel date is required"),
  adults: z.number().int().min(1, "At least 1 adult traveler is required"),
  children: z.number().int().min(0).default(0),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Phone number is required"),
  country: z.string().optional(),
  specialRequests: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      tourSlug,
      travelDate,
      adults,
      children,
      fullName,
      email,
      phone,
      country,
      specialRequests,
    } = parsed.data;

    await connectDB();

    const tour = await Tour.findOne({ slug: tourSlug, published: true });
    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    if (adults + children > tour.maxGroupSize) {
      return NextResponse.json(
        { error: `This tour allows a maximum of ${tour.maxGroupSize} travelers` },
        { status: 400 }
      );
    }

    // Price is always calculated from the tour record, never trusted from the client.
    const totalAmount =
      adults * tour.pricing.adultPrice + children * tour.pricing.childPrice;

    // Attach the logged-in customer if there's a session, otherwise it's a guest booking.
    const session = await getSession();

    const booking = await Booking.create({
      customer: session?.role === "customer" ? session.userId : undefined,
      tour: tour._id,
      travelDate: new Date(travelDate),
      travelers: { adults, children },
      customerInfo: { fullName, email, phone, country },
      specialRequests,
      totalAmount,
      amountPaid: 0,
      status: "pending",
    });

    return NextResponse.json(
      { bookingRef: booking.bookingRef, totalAmount },
      { status: 201 }
    );
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}