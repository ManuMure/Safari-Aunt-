import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import ToursBrowser, { TourListItem } from "@/components/tours/ToursBrowser";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { q?: string };
}

export default async function ToursPage({ searchParams }: PageProps) {
  await connectDB();

  const tours = await Tour.find({ published: true })
    .select("name slug tourType durationDays maxGroupSize pricing images description badge")
    .lean();

  const tourList: TourListItem[] = tours.map((t: any) => ({
    _id: t._id.toString(),
    name: t.name,
    slug: t.slug,
    image: t.images?.[0],
    tourType: t.tourType,
    durationDays: t.durationDays,
    maxGroupSize: t.maxGroupSize,
    adultPrice: t.pricing.adultPrice,
    description: t.description,
    badge: t.badge,
    tags: [t.tourType],
  }));

  return (
    <main>
      <section className="text-center pt-16 pb-4 px-6">
        <h1 className="font-serif text-4xl md:text-5xl text-forest mb-3">
          Curated Journeys
        </h1>
        <p className="text-rust max-w-xl mx-auto">
          Hand-picked itineraries designed to inspire, challenge, and nurture
          your spirit of adventure.
        </p>
      </section>
      <ToursBrowser tours={tourList} initialQuery={searchParams.q ?? ""} />
    </main>
  );
}