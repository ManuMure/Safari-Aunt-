import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import "@/models/Tour";
import BookingDetailForm, { BookingDetail } from "@/components/admin/BookingDetailForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminBookingDetailPage({ params }: PageProps) {
  await connectDB();
  const booking = await Booking.findById(params.id).populate("tour", "name").lean<any>();

  if (!booking) notFound();

  const detail: BookingDetail = {
    _id: booking._id.toString(),
    bookingRef: booking.bookingRef,
    tourName: booking.tour?.name ?? "—",
    travelDate: booking.travelDate,
    travelers: booking.travelers,
    customerInfo: booking.customerInfo,
    specialRequests: booking.specialRequests,
    totalAmount: booking.totalAmount,
    amountPaid: booking.amountPaid,
    status: booking.status,
    internalNotes: booking.internalNotes ?? [],
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Booking Details</h1>
      <BookingDetailForm booking={detail} />
    </div>
  );
}