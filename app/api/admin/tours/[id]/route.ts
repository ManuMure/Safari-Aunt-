import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import "@/models/Destination";
import { requireStaff } from "@/lib/auth";
import { TourInputSchema } from "@/lib/validations/tour";
import Booking from "@/models/Booking";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const tour = await Tour.findById(params.id).lean();

  if (!tour) return NextResponse.json({ error: "Tour not found" }, { status: 404 });
  return NextResponse.json({ tour });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = TourInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    await connectDB();

    const duplicateSlug = await Tour.findOne({
      slug: data.slug,
      _id: { $ne: params.id },
    });
    if (duplicateSlug) {
      return NextResponse.json(
        { error: "Another tour already uses this slug" },
        { status: 409 }
      );
    }

    // The admin form never sends `booked` — it's system-tracked as bookings
    // come in. Preserve it per date, matched by day, and refuse to shrink
    // capacity below what's already booked.
    const existingTour = await Tour.findById(params.id).select("availability").lean<any>();
    const existingBookedByDay = new Map<string, number>(
      (existingTour?.availability ?? []).map((a: any) => [
        new Date(a.date).toISOString().slice(0, 10),
        a.booked,
      ])
    );

    const availability = [];
    for (const a of data.availability) {
      const day = new Date(a.date).toISOString().slice(0, 10);
      const booked = existingBookedByDay.get(day) ?? 0;

      if (a.capacity < booked) {
        return NextResponse.json(
          {
            error: `Can't set capacity for ${day} below ${booked} — that many spots are already booked.`,
          },
          { status: 400 }
        );
      }

      availability.push({
        date: new Date(a.date),
        capacity: a.capacity,
        booked,
        status: a.status,
        adultPriceOverride: a.adultPriceOverride,
        childPriceOverride: a.childPriceOverride,
      });
    }

    const tour = await Tour.findByIdAndUpdate(
      params.id,
      {
        name: data.name,
        slug: data.slug,
        destination: data.destination,
        durationDays: data.durationDays,
        durationNights: data.durationNights,
        tourType: data.tourType,
        difficulty: data.difficulty,
        maxGroupSize: data.maxGroupSize,
        minTravelers: data.minTravelers,
        featured: data.featured,
        published: data.published,
        badge: data.badge || undefined,
        description: data.description,
        pricing: {
          adultPrice: data.adultPrice,
          childPrice: data.childPrice,
          singleRoomSupplement: data.singleRoomSupplement,
          seasonalPricing: data.seasonalPricing.map((s) => ({
            name: s.name,
            startDate: new Date(s.startDate),
            endDate: new Date(s.endDate),
            adultPrice: s.adultPrice,
            childPrice: s.childPrice,
          })),
        },
        availability,
        inclusions: data.inclusions,
        exclusions: data.exclusions,
        whatToBring: data.whatToBring,
        images: data.images,
        itinerary: data.itinerary,
      },
      { new: true }
    );

    if (!tour) return NextResponse.json({ error: "Tour not found" }, { status: 404 });

    return NextResponse.json({ id: tour._id, slug: tour.slug });
  } catch (err) {
    console.error("Update tour error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const bookingCount = await Booking.countDocuments({ tour: params.id });
  if (bookingCount > 0) {
    return NextResponse.json(
      {
        error: `This tour has ${bookingCount} booking${bookingCount > 1 ? "s" : ""} attached to it and can't be deleted. Unpublish it instead to hide it from the site while keeping booking records intact.`,
      },
      { status: 409 }
    );
  }

  const tour = await Tour.findByIdAndDelete(params.id);

  if (!tour) return NextResponse.json({ error: "Tour not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}