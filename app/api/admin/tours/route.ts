import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import "@/models/Destination"; // registers schema so .populate("destination") works
import { requireStaff } from "@/lib/auth";

const ItineraryDaySchema = z.object({
  day: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const TourInputSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  destination: z.string().min(1, "Destination is required"),
  durationDays: z.number().int().min(1),
  durationNights: z.number().int().min(0),
  tourType: z.string().min(1, "Tour type is required"),
  difficulty: z.enum(["easy", "moderate", "challenging"]),
  maxGroupSize: z.number().int().min(1),
  minTravelers: z.number().int().min(1),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  badge: z.string().optional(),
  description: z.string().min(10, "Description is too short"),
  adultPrice: z.number().min(0),
  childPrice: z.number().min(0),
  singleRoomSupplement: z.number().min(0).optional(),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  whatToBring: z.array(z.string()),
  images: z.array(z.string()),
  itinerary: z.array(ItineraryDaySchema),
});

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