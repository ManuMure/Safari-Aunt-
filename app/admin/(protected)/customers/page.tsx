import Link from "next/link";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";

export const dynamic = "force-dynamic";

interface CustomerAgg {
  _id: string; // email
  fullName: string;
  phone: string;
  customerId: string | null;
  totalBookings: number;
  totalSpent: number;
  lastTravelDate: string;
}

export default async function AdminCustomersPage() {
  await connectDB();

  const customers = await Booking.aggregate<CustomerAgg>([
    {
      $group: {
        _id: "$customerInfo.email",
        fullName: { $first: "$customerInfo.fullName" },
        phone: { $first: "$customerInfo.phone" },
        customerId: { $first: "$customer" },
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
        lastTravelDate: { $max: "$travelDate" },
      },
    },
    { $sort: { totalSpent: -1 } },
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Customers</h1>
      <div className="bg-white border border-forest/10 rounded-xl p-6">
        {customers.length === 0 ? (
          <p className="text-forest/60 text-sm py-12 text-center">
            No customers yet — they&rsquo;ll show up here once bookings start
            coming in.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-forest/50 border-b border-forest/10 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Bookings</th>
                <th className="pb-3 font-medium">Total Spent</th>
                <th className="pb-3 font-medium">Last Trip</th>
                <th className="pb-3 font-medium">Account</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-forest/5 last:border-0">
                  <td className="py-3">
                    <Link
                      href={`/admin/customers/${encodeURIComponent(c._id)}`}
                      className="text-forest font-medium hover:underline"
                    >
                      {c.fullName}
                    </Link>
                  </td>
                  <td className="py-3 text-forest/70">{c._id}</td>
                  <td className="py-3 text-forest/70">{c.phone}</td>
                  <td className="py-3 text-forest/70">{c.totalBookings}</td>
                  <td className="py-3 text-forest/70">
                    KSh {c.totalSpent.toLocaleString()}
                  </td>
                  <td className="py-3 text-forest/70">
                    {new Date(c.lastTravelDate).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.customerId
                          ? "bg-forest/10 text-forest"
                          : "bg-forest/5 text-forest/50"
                      }`}
                    >
                      {c.customerId ? "Registered" : "Guest"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}