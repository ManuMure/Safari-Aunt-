import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import "@/models/Destination";
import { requireStaff } from "@/lib/auth";
import { TourInputSchema } from "../route";
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
          seasonalPricing: [],
        },
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