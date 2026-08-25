"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-amber-100 text-amber-700",
  read: "bg-forest/10 text-forest",
  responded: "bg-forest text-cream",
};

export interface InquiryRow {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "responded";
  createdAt: string;
}

export default function AdminInquiriesTable({ inquiries }: { inquiries: InquiryRow[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: InquiryRow["status"]) {
    setUpdatingId(id);
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  function toggleExpand(id: string, currentStatus: InquiryRow["status"]) {
    setExpandedId((prev) => (prev === id ? null : id));
    if (currentStatus === "new") {
      updateStatus(id, "read");
    }
  }

  if (inquiries.length === 0) {
    return (
      <p className="text-forest/60 text-sm py-12 text-center">
        No messages yet — they&rsquo;ll show up here when someone submits the
        contact form.
      </p>
    );
  }

  return (
    <div className="divide-y divide-forest/5">
      {inquiries.map((inquiry) => {
        const expanded = expandedId === inquiry._id;
        return (
          <div key={inquiry._id} className="py-4">
            <button
              onClick={() => toggleExpand(inquiry._id, inquiry.status)}
              className="w-full flex items-center justify-between gap-4 text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-forest">{inquiry.name}</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[inquiry.status]}`}
                  >
                    {inquiry.status}
                  </span>
                </div>
                <p className="text-sm text-forest/60 truncate">{inquiry.subject}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs text-forest/50">
                {new Date(inquiry.createdAt).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "short",
                })}
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {expanded && (
              <div className="mt-3 pl-1 space-y-3">
                <p className="text-sm text-forest/80 whitespace-pre-wrap">{inquiry.message}</p>
                <div className="flex items-center gap-4 text-sm text-forest/60">
                  <a href={`mailto:${inquiry.email}`} className="hover:text-rust">
                    {inquiry.email}
                  </a>
                  {inquiry.phone && (
                    <a href={`tel:${inquiry.phone}`} className="hover:text-rust">
                      {inquiry.phone}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => updateStatus(inquiry._id, "responded")}
                  disabled={updatingId === inquiry._id || inquiry.status === "responded"}
                  className="text-sm font-semibold text-forest hover:text-forest-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inquiry.status === "responded" ? "Marked as responded" : "Mark as responded"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}