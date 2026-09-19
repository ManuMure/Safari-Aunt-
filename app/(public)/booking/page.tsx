import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import BookingForm from "@/components/booking/BookingForm";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { tour?: string };
}

export default async function BookingPage({ searchParams }: PageProps) {
  const tourSlug = searchParams.tour;

  if (!tourSlug) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-forest mb-3">
          Choose a Tour First
        </h1>
        <p className="text-forest/70">
          Head over to our{" "}
          <a href="/tours" className="text-rust underline">
            tours page
          </a>{" "}
          to pick your adventure before booking.
        </p>
      </main>
    );
  }

  await connectDB();
  const tour = await Tour.findOne({ slug: tourSlug, published: true }).lean<any>();

  if (!tour) notFound();

  // Only future, still-open-or-sold-out dates are worth showing — closed
  // dates were never bookable and would just clutter the picker.
  const availability = (tour.availability ?? [])
    .filter((a: any) => new Date(a.date) >= new Date(new Date().toDateString()))
    .filter((a: any) => a.status !== "closed")
    .map((a: any) => ({
      date: new Date(a.date).toISOString(),
      capacity: a.capacity,
      booked: a.booked,
      status: a.status,
      adultPriceOverride: a.adultPriceOverride,
      childPriceOverride: a.childPriceOverride,
    }))
    .sort((a: any, b: any) => a.date.localeCompare(b.date));

  const seasonalPricing = (tour.pricing.seasonalPricing ?? []).map((s: any) => ({
    name: s.name,
    startDate: new Date(s.startDate).toISOString(),
    endDate: new Date(s.endDate).toISOString(),
    adultPrice: s.adultPrice,
    childPrice: s.childPrice,
  }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-serif text-3xl md:text-4xl text-forest mb-2">
        Book Your Story
      </h1>
      <p className="text-forest/70 mb-10">
        You&rsquo;re booking: <span className="font-semibold">{tour.name}</span>
      </p>

      <BookingForm
        tourSlug={tour.slug}
        tourName={tour.name}
        adultPrice={tour.pricing.adultPrice}
        childPrice={tour.pricing.childPrice}
        singleRoomSupplement={tour.pricing.singleRoomSupplement}
        seasonalPricing={seasonalPricing}
        availability={availability}
        maxGroupSize={tour.maxGroupSize}
        minTravelers={tour.minTravelers}
      />
    </main>
  );
}