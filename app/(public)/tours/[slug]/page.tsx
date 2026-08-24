import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Users, Check, X } from "lucide-react";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import "@/models/Destination";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export default async function TourDetailPage({ params }: PageProps) {
  await connectDB();

  const tour = await Tour.findOne({ slug: params.slug, published: true })
    .populate("destination", "name country")
    .lean<any>();

  if (!tour) notFound();

  const destination = tour.destination as { name: string; country: string } | undefined;

  return (
    <main>
      <div className="relative h-80 bg-mustard-light">
        {tour.images?.[0] && (
          <Image
            src={tour.images[0]}
            alt={tour.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 py-8 max-w-5xl mx-auto">
          {tour.badge && (
            <span className="inline-block bg-mustard text-forest text-xs font-bold uppercase px-3 py-1 rounded-full mb-3">
              {tour.badge}
            </span>
          )}
          <h1 className="font-serif text-3xl md:text-4xl text-cream">
            {tour.name}
          </h1>
          {destination && (
            <p className="text-cream/80 text-sm mt-1">
              {destination.name}, {destination.country}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 grid md:grid-cols-[1fr_320px] gap-10">
        <div>
          <div className="flex items-center gap-6 text-forest/70 text-sm mb-6 pb-6 border-b border-forest/10">
            <span className="flex items-center gap-2">
              <Clock size={16} /> {tour.durationDays} Days / {tour.durationNights} Nights
            </span>
            <span className="flex items-center gap-2">
              <Users size={16} /> Max {tour.maxGroupSize} travelers
            </span>
          </div>

          <section className="mb-10">
            <h2 className="font-serif text-2xl text-forest mb-3">Overview</h2>
            <p className="text-forest/70 leading-relaxed">{tour.description}</p>
          </section>

          {tour.itinerary?.length > 0 && (
            <section className="mb-10">
              <h2 className="font-serif text-2xl text-forest mb-5">Itinerary</h2>
              <div className="space-y-6">
                {tour.itinerary.map((day: any) => (
                  <div key={day.day} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center font-semibold text-sm">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="font-semibold text-forest mb-1">{day.title}</h3>
                      <p className="text-sm text-forest/70">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="grid sm:grid-cols-2 gap-8">
            {tour.inclusions?.length > 0 && (
              <div>
                <h3 className="font-semibold text-forest mb-3">What&rsquo;s Included</h3>
                <ul className="space-y-2 text-sm text-forest/70">
                  {tour.inclusions.map((item: string) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check size={16} className="text-forest mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tour.exclusions?.length > 0 && (
              <div>
                <h3 className="font-semibold text-forest mb-3">Not Included</h3>
                <ul className="space-y-2 text-sm text-forest/70">
                  {tour.exclusions.map((item: string) => (
                    <li key={item} className="flex items-start gap-2">
                      <X size={16} className="text-rust mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit bg-white border border-forest/10 rounded-xl p-6 sticky top-24">
          <p className="text-sm text-forest/60 mb-1">From</p>
          <p className="text-3xl font-serif text-rust mb-4">
            KSh {tour.pricing.adultPrice.toLocaleString()}
          </p>
          <p className="text-sm text-forest/60 mb-6">per adult</p>
          <Link
            href={`/booking?tour=${tour.slug}`}
            className="block text-center bg-rust hover:bg-rust-dark text-cream font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Book This Tour
          </Link>
        </aside>
      </div>
    </main>
  );
}