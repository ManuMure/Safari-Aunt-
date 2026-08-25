import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Sparkles } from "lucide-react";
import { connectDB } from "@/lib/db";
import Destination from "@/models/Destination";
import Tour from "@/models/Tour";
import TourCard, { TourCardData } from "@/components/tours/TourCard";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  await connectDB();

  const destination = await Destination.findOne({
    slug: params.slug,
    published: true,
  }).lean<any>();

  if (!destination) notFound();

  const tours = await Tour.find({
    destination: destination._id,
    published: true,
  })
    .select("name slug tourType durationDays maxGroupSize pricing images description badge")
    .lean<any[]>();

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
    <main>
      <div className="relative h-72 bg-mustard-light">
        {destination.coverImage && (
          <Image
            src={destination.coverImage}
            alt={destination.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 py-8 max-w-5xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl text-cream">
            {destination.name}
          </h1>
          <p className="text-cream/80 text-sm mt-1">{destination.country}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-forest/70 leading-relaxed max-w-3xl mb-8">
          {destination.description}
        </p>

        <div className="grid sm:grid-cols-2 gap-8 mb-12">
          {destination.bestTimeToVisit && (
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-rust mt-1 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-forest">Best Time to Visit</p>
                <p className="text-sm text-forest/70">{destination.bestTimeToVisit}</p>
              </div>
            </div>
          )}
          {destination.activities?.length > 0 && (
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="text-rust mt-1 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-forest mb-1">Activities</p>
                <div className="flex flex-wrap gap-2">
                  {destination.activities.map((a: string) => (
                    <span
                      key={a}
                      className="text-xs bg-cream-dark text-forest/70 px-3 py-1 rounded-full"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <h2 className="font-serif text-2xl text-forest mb-5">
          Tours in {destination.name}
        </h2>
        {tourCards.length === 0 ? (
          <p className="text-forest/60 text-sm">
            No tours published for this destination yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {tourCards.map((tour) => (
              <TourCard key={tour._id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}