import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Users } from "lucide-react";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import "@/models/Destination";
import type { Metadata } from "next";
import TourGallery from "@/components/tours/TourGallery";
import TourDetailTabs from "@/components/tours/TourDetailsTabs";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connectDB();
  const tour = await Tour.findOne({ slug: params.slug, published: true })
    .select("name description images")
    .lean<any>();

  if (!tour) return { title: "Tour Not Found | Safari Aunt Expedition" };

  return {
    title: `${tour.name} | Safari Aunt Expedition`,
    description: tour.description?.slice(0, 160),
    openGraph: {
      title: tour.name,
      description: tour.description?.slice(0, 160),
      images: tour.images?.[0] ? [tour.images[0]] : undefined,
    },
  };
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
      <TourGallery
        images={tour.images ?? []}
        alt={tour.name}
        overlay={
          <>
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
          </>
        }
      />

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

          <TourDetailTabs
            description={tour.description}
            itinerary={tour.itinerary ?? []}
            inclusions={tour.inclusions ?? []}
            exclusions={tour.exclusions ?? []}
            whatToBring={tour.whatToBring ?? []}
            cancellationPolicy={tour.cancellationPolicy}
          />
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