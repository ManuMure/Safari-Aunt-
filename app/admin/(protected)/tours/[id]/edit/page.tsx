import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import Destination from "@/models/Destination";
import TourForm, { TourFormValues } from "@/components/admin/TourForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function EditTourPage({ params }: PageProps) {
  await connectDB();

  const [tour, destinations] = await Promise.all([
    Tour.findById(params.id).lean<any>(),
    Destination.find().select("name country").lean<any[]>(),
  ]);

  if (!tour) notFound();

  const destinationOptions = destinations.map((d) => ({
    _id: d._id.toString(),
    name: d.name,
    country: d.country,
  }));

  const initialValues: TourFormValues = {
    name: tour.name,
    slug: tour.slug,
    destination: tour.destination.toString(),
    durationDays: tour.durationDays,
    durationNights: tour.durationNights,
    tourType: tour.tourType,
    difficulty: tour.difficulty,
    maxGroupSize: tour.maxGroupSize,
    minTravelers: tour.minTravelers,
    featured: tour.featured,
    published: tour.published,
    badge: tour.badge ?? "",
    description: tour.description,
    adultPrice: tour.pricing.adultPrice,
    childPrice: tour.pricing.childPrice,
    singleRoomSupplement: tour.pricing.singleRoomSupplement ?? "",
    seasonalPricing: (tour.pricing.seasonalPricing ?? []).map((s: any) => ({
      name: s.name,
      startDate: new Date(s.startDate).toISOString().slice(0, 10),
      endDate: new Date(s.endDate).toISOString().slice(0, 10),
      adultPrice: s.adultPrice,
      childPrice: s.childPrice,
    })),
    availability: (tour.availability ?? []).map((a: any) => ({
      date: new Date(a.date).toISOString().slice(0, 10),
      capacity: a.capacity,
      booked: a.booked,
      status: a.status,
      adultPriceOverride: a.adultPriceOverride ?? "",
      childPriceOverride: a.childPriceOverride ?? "",
    })),
    inclusions: (tour.inclusions ?? []).join("\n"),
    exclusions: (tour.exclusions ?? []).join("\n"),
    whatToBring: (tour.whatToBring ?? []).join("\n"),
    images: (tour.images ?? []).join("\n"),
    itinerary: tour.itinerary ?? [],
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Edit Tour</h1>
      <TourForm
        mode="edit"
        tourId={tour._id.toString()}
        destinations={destinationOptions}
        initialValues={initialValues}
      />
    </div>
  );
}