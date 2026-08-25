import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import "@/models/Tour";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-forest/10 text-forest",
  completed: "bg-forest text-cream",
  cancelled: "bg-red-100 text-red-700",
};

interface PageProps {
  params: { email: string };
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const email = decodeURIComponent(params.email);

  await connectDB();
  const bookings = await Booking.find({ "customerInfo.email": email })
    .populate("tour", "name")
    .sort({ createdAt: -1 })
    .lean<any[]>();

  if (bookings.length === 0) notFound();

  const { fullName, phone, country } = bookings[0].customerInfo;
  const totalSpent = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const lastTravelDate = bookings.reduce(
    (latest, b) => (new Date(b.travelDate) > new Date(latest) ? b.travelDate : latest),
    bookings[0].travelDate
  );

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-1">{fullName}</h1>
      <p className="text-forest/60 mb-8">
        {email}
        {phone && ` · ${phone}`}
        {country && ` · ${country}`}
      </p>

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Bookings" value={bookings.length.toString()} />
        <StatCard label="Total Spent" value={`KSh ${totalSpent.toLocaleString()}`} />
        <StatCard
          label="Last Trip"
          value={new Date(lastTravelDate).toLocaleDateString("en-KE", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        />
      </div>

      <div className="bg-white border border-forest/10 rounded-xl p-6">
        <h2 className="font-semibold text-forest mb-4">Booking History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-forest/50 border-b border-forest/10 text-xs uppercase tracking-wide">
              <th className="pb-3 font-medium">Ref</th>
              <th className="pb-3 font-medium">Tour</th>
              <th className="pb-3 font-medium">Travel Date</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id.toString()} className="border-b border-forest/5 last:border-0">
                <td className="py-3 text-forest font-medium">{b.bookingRef}</td>
                <td className="py-3 text-forest/70">{b.tour?.name ?? "—"}</td>
                <td className="py-3 text-forest/70">
                  {new Date(b.travelDate).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="py-3 text-forest/70">KSh {b.totalAmount.toLocaleString()}</td>
                <td className="py-3">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      STATUS_STYLES[b.status] ?? "bg-forest/10 text-forest"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/bookings/${b._id}`}
                    className="text-forest font-medium hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-forest/10 rounded-xl p-6">
      <p className="text-sm text-forest/60 mb-1">{label}</p>
      <p className="text-2xl font-serif text-forest">{value}</p>
    </div>
  );
}