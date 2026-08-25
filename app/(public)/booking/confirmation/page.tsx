import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import "@/models/Tour"; // registers schema so .populate("tour") works

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { ref?: string };
}

export default async function BookingConfirmationPage({ searchParams }: PageProps) {
  const ref = searchParams.ref;
  if (!ref) notFound();

  await connectDB();
  const booking = await Booking.findOne({ bookingRef: ref })
    .populate("tour", "name")
    .lean<any>();

  if (!booking) notFound();

  const balance = booking.totalAmount - booking.amountPaid;

  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      <CheckCircle2 size={48} className="text-forest mx-auto mb-4" />
      <h1 className="font-serif text-3xl text-forest mb-2">Booking Confirmed</h1>
      <p className="text-forest/70 mb-10">
        We&rsquo;ve received your booking — a confirmation email is on its way.
      </p>

      <div className="bg-white border border-forest/10 rounded-xl p-8 text-left space-y-4">
        <Row label="Booking ID" value={booking.bookingRef} />
        <Row label="Tour" value={booking.tour?.name ?? "—"} />
        <Row
          label="Travel Date"
          value={new Date(booking.travelDate).toLocaleDateString("en-KE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />
        <Row
          label="Travelers"
          value={`${booking.travelers.adults} Adult${booking.travelers.adults > 1 ? "s" : ""}${
            booking.travelers.children > 0 ? `, ${booking.travelers.children} Child${booking.travelers.children > 1 ? "ren" : ""}` : ""
          }`}
        />
        <div className="border-t border-forest/10 pt-4">
          <Row label="Total" value={`KSh ${booking.totalAmount.toLocaleString()}`} />
          <Row label="Paid" value={`KSh ${booking.amountPaid.toLocaleString()}`} />
          <Row label="Balance Due" value={`KSh ${balance.toLocaleString()}`} bold />
        </div>
      </div>

      <Link
        href="/tours"
        className="inline-block mt-10 text-rust font-semibold hover:underline"
      >
        Browse more tours
      </Link>
    </main>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-forest/60">{label}</span>
      <span className={bold ? "font-semibold text-forest" : "text-forest"}>{value}</span>
    </div>
  );
}