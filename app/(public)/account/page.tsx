import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Booking from "@/models/Booking";
import "@/models/Tour";
import VerifyEmailBanner from "@/components/account/verify-email-banner";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-forest/10 text-forest",
  completed: "bg-forest text-cream",
  cancelled: "bg-red-100 text-red-700",
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session || session.role !== "customer") {
    redirect("/login");
  }

  await connectDB();

  const [user, bookings] = await Promise.all([
    User.findById(session.userId).select("name email phone emailVerified").lean<any>(),
    Booking.find({ customer: session.userId })
      .populate("tour", "name")
      .sort({ travelDate: -1 })
      .lean<any[]>(),
  ]);

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => new Date(b.travelDate) >= now && b.status !== "cancelled"
  );
  const past = bookings.filter(
    (b) => new Date(b.travelDate) < now || b.status === "cancelled"
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-serif text-3xl text-forest mb-1">
        Welcome, {user?.name?.split(" ")[0]}
      </h1>
      <p className="text-forest/60 mb-10">{user?.email}</p>

      {user && !user.emailVerified && <VerifyEmailBanner email={user.email} />}

      <section className="mb-12">
        <h2 className="font-serif text-xl text-forest mb-4">Upcoming Trips</h2>
        {upcoming.length === 0 ? (
          <EmptyState message="No upcoming trips yet." />
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingRow key={b._id.toString()} booking={b} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-xl text-forest mb-4">Past Trips</h2>
        {past.length === 0 ? (
          <EmptyState message="Your completed trips will show up here." />
        ) : (
          <div className="space-y-3">
            {past.map((b) => (
              <BookingRow key={b._id.toString()} booking={b} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white border border-forest/10 rounded-xl p-8 text-center">
      <p className="text-forest/60 text-sm mb-4">{message}</p>
      <Link href="/tours" className="text-rust font-semibold hover:underline text-sm">
        Browse tours →
      </Link>
    </div>
  );
}

function BookingRow({ booking }: { booking: any }) {
  return (
    <Link
      href={`/booking/confirmation?ref=${booking.bookingRef}`}
      className="flex items-center justify-between bg-white border border-forest/10 rounded-xl p-5 hover:border-forest/30 transition-colors"
    >
      <div>
        <p className="font-semibold text-forest">{booking.tour?.name ?? "—"}</p>
        <p className="text-sm text-forest/60">
          {new Date(booking.travelDate).toLocaleDateString("en-KE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {" · "}
          {booking.bookingRef}
        </p>
      </div>
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
          STATUS_STYLES[booking.status] ?? "bg-forest/10 text-forest"
        }`}
      >
        {booking.status}
      </span>
    </Link>
  );
}