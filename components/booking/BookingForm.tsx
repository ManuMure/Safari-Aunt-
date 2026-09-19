"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { resolvePricing, type SeasonalPriceInput } from "@/lib/pricing";

interface AvailabilityDateProp {
  date: string;
  capacity: number;
  booked: number;
  status: "open" | "closed" | "sold_out";
  adultPriceOverride?: number;
  childPriceOverride?: number;
}

interface BookingFormProps {
  tourSlug: string;
  tourName: string;
  adultPrice: number;
  childPrice: number;
  singleRoomSupplement?: number;
  seasonalPricing: SeasonalPriceInput[];
  availability: AvailabilityDateProp[];
  maxGroupSize: number;
  minTravelers: number;
}

export default function BookingForm({
  tourSlug,
  tourName,
  adultPrice,
  childPrice,
  singleRoomSupplement,
  seasonalPricing,
  availability,
  maxGroupSize,
  minTravelers,
}: BookingFormProps) {
  const router = useRouter();

  const hasFixedDepartures = availability.length > 0;

  const [travelDate, setTravelDate] = useState("");
  const [adults, setAdults] = useState(Math.max(1, minTravelers));
  const [children, setChildren] = useState(0);
  const [wantsSingleRoom, setWantsSingleRoom] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAvailability = useMemo(
    () => availability.find((a) => a.date === travelDate),
    [availability, travelDate]
  );

  const pricing = useMemo(() => {
    if (!travelDate) return { adultPrice, childPrice, seasonName: undefined as string | undefined };
    return resolvePricing({ adultPrice, childPrice, seasonalPricing }, availability, travelDate);
  }, [travelDate, adultPrice, childPrice, seasonalPricing, availability]);

  const singleRoomFee = wantsSingleRoom ? singleRoomSupplement ?? 0 : 0;

  const total = useMemo(
    () => adults * pricing.adultPrice + children * pricing.childPrice + singleRoomFee,
    [adults, children, pricing, singleRoomFee]
  );

  const totalTravelers = adults + children;
  const remainingSpots = selectedAvailability
    ? selectedAvailability.capacity - selectedAvailability.booked
    : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (totalTravelers < minTravelers) {
      setError(`This tour requires at least ${minTravelers} traveler(s).`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourSlug,
          travelDate,
          adults,
          children,
          wantsSingleRoom,
          fullName,
          email,
          phone,
          country,
          specialRequests,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/booking/confirmation?ref=${data.bookingRef}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-[1fr_320px] gap-10">
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl text-forest mb-4">Trip Details</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-forest mb-1">
                Travel Date
              </label>
              {hasFixedDepartures ? (
                <select
                  required
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="" disabled>
                    Choose a departure
                  </option>
                  {availability.map((a) => {
                    const spotsLeft = a.capacity - a.booked;
                    const soldOut = a.status === "sold_out" || spotsLeft <= 0;
                    return (
                      <option key={a.date} value={a.date} disabled={soldOut}>
                        {new Date(a.date).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {soldOut ? " — Fully booked" : ` — ${spotsLeft} spots left`}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  type="date"
                  required
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-forest mb-1">
                Adults
              </label>
              <input
                type="number"
                min={1}
                required
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest mb-1">
                Children
              </label>
              <input
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-forest/50 mt-2">
            {minTravelers > 1 ? `Minimum ${minTravelers}, maximum ` : "Maximum "}
            {maxGroupSize} travelers for this tour.
          </p>
          {hasFixedDepartures && remainingSpots !== undefined && (
            <p className="text-xs text-rust mt-1">
              {remainingSpots} spot{remainingSpots === 1 ? "" : "s"} left on this date.
            </p>
          )}
          {pricing.seasonName && (
            <p className="text-xs text-forest/60 mt-1">
              {pricing.seasonName} pricing applied for this date.
            </p>
          )}

          {singleRoomSupplement ? (
            <label className="flex items-center gap-2 text-sm text-forest/80 mt-4">
              <input
                type="checkbox"
                checked={wantsSingleRoom}
                onChange={(e) => setWantsSingleRoom(e.target.checked)}
                className="accent-forest"
              />
              I need a single room (+KSh {singleRoomSupplement.toLocaleString()})
            </label>
          ) : null}
        </div>

        <div>
          <h2 className="font-serif text-2xl text-forest mb-4">Your Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-forest mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest mb-1">
                Phone
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-forest mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-forest mb-1">
                Special Requests (optional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
      </div>

      <aside className="h-fit bg-white border border-forest/10 rounded-xl p-6 sticky top-24">
        <h3 className="font-semibold text-forest mb-4">{tourName}</h3>

        <div className="space-y-2 text-sm text-forest/70 mb-4">
          <div className="flex justify-between">
            <span>{adults} × Adult</span>
            <span>KSh {(adults * pricing.adultPrice).toLocaleString()}</span>
          </div>
          {children > 0 && (
            <div className="flex justify-between">
              <span>{children} × Child</span>
              <span>KSh {(children * pricing.childPrice).toLocaleString()}</span>
            </div>
          )}
          {singleRoomFee > 0 && (
            <div className="flex justify-between">
              <span>Single room</span>
              <span>KSh {singleRoomFee.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between font-semibold text-forest border-t border-forest/10 pt-4 mb-6">
          <span>Total</span>
          <span>KSh {total.toLocaleString()}</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-rust hover:bg-rust-dark disabled:opacity-60 text-cream font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {submitting ? "Submitting..." : "Confirm Booking"}
        </button>
      </aside>
    </form>
  );
}