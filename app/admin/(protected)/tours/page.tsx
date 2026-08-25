import Link from "next/link";
import { Plus } from "lucide-react";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import "@/models/Destination";
import AdminToursTable, { AdminTourRow } from "@/components/admin/AdminToursTable";

export const dynamic = "force-dynamic";

export default async function AdminToursPage() {
  await connectDB();

  const tours = await Tour.find()
    .populate("destination", "name")
    .sort({ createdAt: -1 })
    .lean<any[]>();

  const rows: AdminTourRow[] = tours.map((t) => ({
    _id: t._id.toString(),
    name: t.name,
    slug: t.slug,
    destinationName: t.destination?.name ?? "—",
    adultPrice: t.pricing.adultPrice,
    published: t.published,
    badge: t.badge,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-forest">Tours</h1>
        <Link
          href="/admin/tours/new"
          className="flex items-center gap-2 bg-rust hover:bg-rust-dark text-cream font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} /> New Tour
        </Link>
      </div>

      <div className="bg-white border border-forest/10 rounded-xl p-6">
        <AdminToursTable tours={rows} />
      </div>
    </div>
  );
}