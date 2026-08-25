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