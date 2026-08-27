import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import "@/models/Destination"; // registers schema so .populate("destination") works
import { requireStaff } from "@/lib/auth";
import { TourInputSchema } from "@/lib/validations/tour";



export async function GET() {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const tours = await Tour.find()
    .populate("destination", "name country")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ tours });
}

export async function POST(req: NextRequest) {
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

    const existing = await Tour.findOne({ slug: data.slug });
    if (existing) {
      return NextResponse.json(
        { error: "A tour with this slug already exists" },
        { status: 409 }
      );
    }

    const tour = await Tour.create({
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
    });

    return NextResponse.json({ id: tour._id, slug: tour.slug }, { status: 201 });
  } catch (err) {
    console.error("Create tour error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}