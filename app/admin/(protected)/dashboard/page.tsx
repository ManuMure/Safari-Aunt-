import { Wallet, CalendarCheck, PlaneTakeoff, AlertTriangle } from "lucide-react";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import Booking from "@/models/Booking";
import "@/models/Destination";
import RevenueChart from "@/components/admin/RevenueChart";
import DestinationsChart from "@/components/admin/DestinationsChart";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-forest/10 text-forest",
  completed: "bg-forest text-cream",
  cancelled: "bg-red-100 text-red-700",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AdminDashboardPage() {
  await connectDB();

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    bookingCount,
    upcomingTrips,
    pendingPayments,
    revenueAgg,
    recentBookings,
    revenueByMonth,
    topDestinationsRaw,
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ travelDate: { $gte: now }, status: { $ne: "cancelled" } }),
    Booking.countDocuments({ $expr: { $lt: ["$amountPaid", "$totalAmount"] } }),
    Booking.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Booking.find().sort({ createdAt: -1 }).limit(5).populate("tour", "name").lean<any[]>(),
    Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Booking.aggregate([
      {
        $lookup: {
          from: "tours",
          localField: "tour",
          foreignField: "_id",
          as: "tourDoc",
        },
      },
      { $unwind: "$tourDoc" },
      {
        $lookup: {
          from: "destinations",
          localField: "tourDoc.destination",
          foreignField: "_id",
          as: "destDoc",
        },
      },
      { $unwind: "$destDoc" },
      { $group: { _id: "$destDoc.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 4 },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total ?? 0;

  const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueChartData = revenueByMonth.map((r: any) => ({
    month: MONTH_LABELS[r._id.month - 1],
    total: r.total,
  }));

  const destinationsChartData = topDestinationsRaw.map((d: any) => ({
    name: d._id,
    count: d.count,
  }));

  const stats = [
    {
      label: "Total Bookings",
      value: bookingCount.toString(),
      icon: CalendarCheck,
      iconBg: "bg-forest/10 text-forest",
    },
    {
      label: "Revenue Booked",
      value: `KSh ${totalRevenue.toLocaleString()}`,
      icon: Wallet,
      iconBg: "bg-mustard/20 text-mustard",
    },
    {
      label: "Upcoming Trips",
      value: upcomingTrips.toString(),
      icon: PlaneTakeoff,
      iconBg: "bg-rust/10 text-rust",
      note: "Departing from today",
    },
    {
      label: "Pending Payments",
      value: pendingPayments.toString(),
      icon: AlertTriangle,
      iconBg: "bg-red-100 text-red-600",
      note: pendingPayments > 0 ? "Needs follow-up" : undefined,
      warn: pendingPayments > 0,
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Dashboard Overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(({ label, value, icon: Icon, iconBg, note, warn }) => (
          <div key={label} className="bg-white border border-forest/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-forest/50">
                {label}
              </p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-serif text-forest mb-1">{value}</p>
            {note && (
              <p className={`text-xs ${warn ? "text-red-600 font-medium" : "text-forest/50"}`}>
                {note}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 mb-8">
        <div className="bg-white border border-forest/10 rounded-xl p-6">
          <h2 className="font-semibold text-forest mb-4">Revenue Trend</h2>
          {revenueChartData.length === 0 ? (
            <p className="text-sm text-forest/50 py-16 text-center">
              No booking revenue in the last 6 months yet.
            </p>
          ) : (
            <RevenueChart data={revenueChartData} />
          )}
        </div>

        <div className="bg-white border border-forest/10 rounded-xl p-6">
          <h2 className="font-semibold text-forest mb-4">Top Destinations</h2>
          {destinationsChartData.length === 0 ? (
            <p className="text-sm text-forest/50 py-16 text-center">
              No bookings yet to rank destinations.
            </p>
          ) : (
            <DestinationsChart data={destinationsChartData} />
          )}
        </div>
      </div>

      <div className="bg-white border border-forest/10 rounded-xl p-6">
        <h2 className="font-semibold text-forest mb-4">Recent Bookings</h2>
        {recentBookings.length === 0 ? (
          <p className="text-forest/60 text-sm">
            No bookings yet — they&rsquo;ll show up here as customers book tours.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-forest/50 border-b border-forest/10 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Booking ID</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Tour</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b: any) => (
                <tr key={b._id} className="border-b border-forest/5 last:border-0">
                  <td className="py-3 text-forest font-medium">{b.bookingRef}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-forest/10 text-forest flex items-center justify-center text-xs font-bold shrink-0">
                        {initials(b.customerInfo.fullName)}
                      </div>
                      <span className="text-forest/80">{b.customerInfo.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-forest/80">{b.tour?.name ?? "—"}</td>
                  <td className="py-3 text-forest/80">KSh {b.totalAmount.toLocaleString()}</td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        STATUS_STYLES[b.status] ?? "bg-forest/10 text-forest"
                      }`}
                    >
                      {b.status}
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