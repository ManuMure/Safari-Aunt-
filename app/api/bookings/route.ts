import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Tour, { type IAvailabilityDate } from "@/models/Tour";
import Booking from "@/models/Booking";
import { getSession } from "@/lib/auth";
import { isPastDate, resolvePricing } from "@/lib/pricing";

const BookingSchema = z.object({
  tourSlug: z.string().min(1),
  travelDate: z.string().min(1, "Travel date is required"),
  adults: z.number().int().min(1, "At least 1 adult traveler is required"),
  children: z.number().int().min(0).default(0),
  wantsSingleRoom: z.boolean().default(false),
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
      wantsSingleRoom,
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

    const totalTravelers = adults + children;

    if (isPastDate(travelDate)) {
      return NextResponse.json(
        { error: "Please choose a future travel date." },
        { status: 400 }
      );
    }

    if (totalTravelers < tour.minTravelers) {
      return NextResponse.json(
        { error: `This tour requires at least ${tour.minTravelers} traveler(s).` },
        { status: 400 }
      );
    }

    if (totalTravelers > tour.maxGroupSize) {
      return NextResponse.json(
        { error: `This tour allows a maximum of ${tour.maxGroupSize} travelers` },
        { status: 400 }
      );
    }

    // Tours with fixed departure dates only sell on dates the admin defined
    // in the availability calendar. Tours with an empty calendar are
    // treated as flexible/private departures, bookable any future date.
    const hasFixedDepartures = tour.availability.length > 0;
    const matchedAvailability = tour.availability.find((a: IAvailabilityDate) => {
      const entryTime = Date.UTC(
        a.date.getUTCFullYear(),
        a.date.getUTCMonth(),
        a.date.getUTCDate()
      );
      const requestedTime = Date.UTC(
        new Date(travelDate).getUTCFullYear(),
        new Date(travelDate).getUTCMonth(),
        new Date(travelDate).getUTCDate()
      );
      return entryTime === requestedTime;
    });

    if (hasFixedDepartures) {
      if (!matchedAvailability) {
        return NextResponse.json(
          {
            error:
              "That date isn't one of the scheduled departures for this tour. Please choose a listed date.",
          },
          { status: 400 }
        );
      }

      if (matchedAvailability.status !== "open") {
        return NextResponse.json(
          { error: "That departure date is no longer available." },
          { status: 400 }
        );
      }

      const remaining = matchedAvailability.capacity - matchedAvailability.booked;
      if (totalTravelers > remaining) {
        return NextResponse.json(
          {
            error:
              remaining > 0
                ? `Only ${remaining} spot(s) left on that date.`
                : "That date is fully booked.",
          },
          { status: 400 }
        );
      }
    }

    // Price is always calculated from the tour record, never trusted from
    // the client: a per-date override, then a matching season, then base price.
    const resolved = resolvePricing(tour.pricing, tour.availability, travelDate);
    const singleRoomFee =
      wantsSingleRoom && tour.pricing.singleRoomSupplement
        ? tour.pricing.singleRoomSupplement
        : 0;
    const totalAmount =
      adults * resolved.adultPrice + children * resolved.childPrice + singleRoomFee;

    // Reserve the capacity atomically before creating the booking, so two
    // simultaneous requests for the last spot can't both succeed.
    let reservedAvailability = false;
    if (hasFixedDepartures && matchedAvailability) {
      const capacityGuard = matchedAvailability.capacity - totalTravelers;
      const reserveResult = await Tour.updateOne(
        { _id: tour._id },
        { $inc: { "availability.$[elem].booked": totalTravelers } },
        {
          arrayFilters: [
            { "elem.date": matchedAvailability.date, "elem.booked": { $lte: capacityGuard } },
          ],
        }
      );

      if (reserveResult.modifiedCount === 0) {
        return NextResponse.json(
          { error: "Sorry, that date just sold out. Please choose another date." },
          { status: 409 }
        );
      }
      reservedAvailability = true;

      // Best-effort: flip the date to sold_out once capacity is fully used,
      // so it shows correctly in admin and stops appearing as bookable.
      const newBooked = matchedAvailability.booked + totalTravelers;
      if (newBooked >= matchedAvailability.capacity) {
        Tour.updateOne(
          { _id: tour._id, "availability.date": matchedAvailability.date },
          { $set: { "availability.$.status": "sold_out" } }
        ).catch((err) => console.error("Failed to flag date as sold out:", err));
      }
    }

    // Attach the logged-in customer if there's a session, otherwise it's a guest booking.
    const session = await getSession();

    try {
      const booking = await Booking.create({
        customer: session?.role === "customer" ? session.userId : undefined,
        tour: tour._id,
        travelDate: new Date(travelDate),
        travelers: { adults, children },
        customerInfo: { fullName, email, phone, country },
        specialRequests,
        totalAmount,
        amountPaid: 0,
        priceBreakdown: {
          adultPrice: resolved.adultPrice,
          childPrice: resolved.childPrice,
          singleRoomSupplement: singleRoomFee || undefined,
          seasonName: resolved.seasonName,
        },
        status: "pending",
      });

      return NextResponse.json(
        { bookingRef: booking.bookingRef, totalAmount },
        { status: 201 }
      );
    } catch (bookingErr) {
      // Booking creation failed after we already reserved a spot — give it back.
      if (reservedAvailability && matchedAvailability) {
        await Tour.updateOne(
          { _id: tour._id, "availability.date": matchedAvailability.date },
          { $inc: { "availability.$.booked": -totalTravelers } }
        ).catch((err) => console.error("Failed to release reserved availability:", err));
      }
      throw bookingErr;
    }
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}