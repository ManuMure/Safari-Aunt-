"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface BookingFormProps {
  tourSlug: string;
  tourName: string;
  adultPrice: number;
  childPrice: number;
  maxGroupSize: number;
}

export default function BookingForm({
  tourSlug,
  tourName,
  adultPrice,
  childPrice,
  maxGroupSize,
}: BookingFormProps) {
  const router = useRouter();

  const [travelDate, setTravelDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(
    () => adults * adultPrice + children * childPrice,
    [adults, children, adultPrice, childPrice]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
              <input
                type="date"
                required
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
              />
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
            Maximum {maxGroupSize} travelers per group for this tour.
          </p>
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
            <span>KSh {(adults * adultPrice).toLocaleString()}</span>
          </div>
          {children > 0 && (
            <div className="flex justify-between">
              <span>{children} × Child</span>
              <span>KSh {(children * childPrice).toLocaleString()}</span>
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