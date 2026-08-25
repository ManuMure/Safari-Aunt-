import { connectDB } from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import AdminInquiriesTable, { InquiryRow } from "@/components/admin/AdminInquiriesTable";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  await connectDB();
  const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean<any[]>();

  const rows: InquiryRow[] = inquiries.map((i) => ({
    _id: i._id.toString(),
    name: i.name,
    email: i.email,
    phone: i.phone,
    subject: i.subject,
    message: i.message,
    status: i.status,
    createdAt: i.createdAt,
  }));

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Messages</h1>
      <div className="bg-white border border-forest/10 rounded-xl p-6">
        <AdminInquiriesTable inquiries={rows} />
      </div>
    </div>
  );
}