import Link from "next/link";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import TourCard, { TourCardData } from "@/components/tours/TourCard";

export default async function FeaturedTours() {
  await connectDB();

  const tours = await Tour.find({ featured: true, published: true })
    .select("name slug tourType durationDays maxGroupSize pricing images description badge")
    .limit(3)
    .lean<any[]>();

  if (tours.length === 0) return null;

  const tourCards: TourCardData[] = tours.map((t) => ({
    _id: t._id.toString(),
    name: t.name,
    slug: t.slug,
    image: t.images?.[0],
    durationDays: t.durationDays,
    maxGroupSize: t.maxGroupSize,
    adultPrice: t.pricing.adultPrice,
    description: t.description,
    badge: t.badge,
    tags: [t.tourType],
  }));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl text-forest mb-2">
            Popular Journeys
          </h2>
          <p className="text-forest/70">Hand-picked adventures our travelers love most.</p>
        </div>
        <Link href="/tours" className="text-rust font-semibold hover:underline whitespace-nowrap">
          View All Tours →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tourCards.map((tour) => (
          <TourCard key={tour._id} tour={tour} />
        ))}
      </div>
    </section>
  );
}