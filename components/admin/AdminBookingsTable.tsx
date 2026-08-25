import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-forest/10 text-forest",
  completed: "bg-forest text-cream",
  cancelled: "bg-red-100 text-red-700",
};

export interface AdminBookingRow {
  _id: string;
  bookingRef: string;
  customerName: string;
  tourName: string;
  travelDate: string;
  totalAmount: number;
  amountPaid: number;
  status: string;
}

export default function AdminBookingsTable({ bookings }: { bookings: AdminBookingRow[] }) {
  if (bookings.length === 0) {
    return (
      <p className="text-forest/60 text-sm py-12 text-center">
        No bookings yet — they&rsquo;ll show up here as customers book tours.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-forest/50 border-b border-forest/10 text-xs uppercase tracking-wide">
          <th className="pb-3 font-medium">Ref</th>
          <th className="pb-3 font-medium">Customer</th>
          <th className="pb-3 font-medium">Tour</th>
          <th className="pb-3 font-medium">Travel Date</th>
          <th className="pb-3 font-medium">Total</th>
          <th className="pb-3 font-medium">Paid</th>
          <th className="pb-3 font-medium">Status</th>
          <th className="pb-3 font-medium text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b._id} className="border-b border-forest/5 last:border-0">
            <td className="py-3 text-forest font-medium">{b.bookingRef}</td>
            <td className="py-3 text-forest/80">{b.customerName}</td>
            <td className="py-3 text-forest/80">{b.tourName}</td>
            <td className="py-3 text-forest/70">
              {new Date(b.travelDate).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </td>
            <td className="py-3 text-forest/80">KSh {b.totalAmount.toLocaleString()}</td>
            <td className="py-3 text-forest/80">KSh {b.amountPaid.toLocaleString()}</td>
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
  );
}