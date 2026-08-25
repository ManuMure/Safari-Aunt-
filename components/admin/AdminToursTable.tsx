"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

export interface AdminTourRow {
  _id: string;
  name: string;
  slug: string;
  destinationName: string;
  adultPrice: number;
  published: boolean;
  badge?: string;
}

export default function AdminToursTable({ tours }: { tours: AdminTourRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/tours/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete tour");
        return;
      }
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (tours.length === 0) {
    return (
      <p className="text-forest/60 text-sm py-12 text-center">
        No tours yet — click &ldquo;New Tour&rdquo; to create your first one.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-forest/50 border-b border-forest/10 text-xs uppercase tracking-wide">
          <th className="pb-3 font-medium">Name</th>
          <th className="pb-3 font-medium">Destination</th>
          <th className="pb-3 font-medium">Price</th>
          <th className="pb-3 font-medium">Status</th>
          <th className="pb-3 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {tours.map((tour) => (
          <tr key={tour._id} className="border-b border-forest/5 last:border-0">
            <td className="py-3 text-forest font-medium">
              {tour.name}
              {tour.badge && (
                <span className="ml-2 text-xs bg-mustard/20 text-mustard px-2 py-0.5 rounded-full">
                  {tour.badge}
                </span>
              )}
            </td>
            <td className="py-3 text-forest/70">{tour.destinationName}</td>
            <td className="py-3 text-forest/70">KSh {tour.adultPrice.toLocaleString()}</td>
            <td className="py-3">
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                  tour.published ? "bg-forest/10 text-forest" : "bg-forest/5 text-forest/50"
                }`}
              >
                {tour.published ? "Published" : "Draft"}
              </span>
            </td>
            <td className="py-3">
              <div className="flex items-center justify-end gap-3">
                <Link
                  href={`/admin/tours/${tour._id}/edit`}
                  className="text-forest/60 hover:text-forest"
                  aria-label="Edit"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(tour._id, tour.name)}
                  disabled={deletingId === tour._id}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}