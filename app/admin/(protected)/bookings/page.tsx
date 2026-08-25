import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import "@/models/Tour";
import AdminBookingsTable, { AdminBookingRow } from "@/components/admin/AdminBookingsTable";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  await connectDB();

  const bookings = await Booking.find()
    .populate("tour", "name")
    .sort({ createdAt: -1 })
    .lean<any[]>();

  const rows: AdminBookingRow[] = bookings.map((b) => ({
    _id: b._id.toString(),
    bookingRef: b.bookingRef,
    customerName: b.customerInfo.fullName,
    tourName: b.tour?.name ?? "—",
    travelDate: b.travelDate,
    totalAmount: b.totalAmount,
    amountPaid: b.amountPaid,
    status: b.status,
  }));

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Bookings</h1>
      <div className="bg-white border border-forest/10 rounded-xl p-6">
        <AdminBookingsTable bookings={rows} />
      </div>
    </div>
  );
}