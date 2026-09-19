"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface BookingDetail {
  _id: string;
  bookingRef: string;
  tourName: string;
  travelDate: string;
  travelers: { adults: number; children: number };
  customerInfo: { fullName: string; email: string; phone: string; country?: string };
  specialRequests?: string;
  totalAmount: number;
  amountPaid: number;

    priceBreakdown?: {
    adultPrice: number;
    childPrice: number;
    singleRoomSupplement?: number;
    seasonName?: string;
  };

  
  status: "pending" | "confirmed" | "cancelled" | "completed";
  internalNotes: string[];
}



export default function BookingDetailForm({ booking }: { booking: BookingDetail }) {
  const router = useRouter();
  const [status, setStatus] = useState(booking.status);
  const [amountPaid, setAmountPaid] = useState(booking.amountPaid);
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(booking.internalNotes);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveUpdate(payload: Record<string, unknown>) {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Network error. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    await saveUpdate({ status, amountPaid: Number(amountPaid) });
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    const ok = await saveUpdate({ addNote: newNote.trim() });
    if (ok) {
      setNotes((prev) => [...prev, newNote.trim()]);
      setNewNote("");
    }
  }

  const balance = booking.totalAmount - amountPaid;

  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-10">
      <div className="space-y-6">
        <div className="bg-white border border-forest/10 rounded-xl p-6">
          <h2 className="font-semibold text-forest mb-4">Trip Details</h2>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <Detail label="Tour" value={booking.tourName} />
            <Detail
              label="Travel Date"
              value={new Date(booking.travelDate).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <Detail
              label="Travelers"
              value={`${booking.travelers.adults} Adult${booking.travelers.adults > 1 ? "s" : ""}${
                booking.travelers.children > 0 ? `, ${booking.travelers.children} Child${booking.travelers.children > 1 ? "ren" : ""}` : ""
              }`}
            />
            {booking.specialRequests && (
              <Detail label="Special Requests" value={booking.specialRequests} />
            )}
          </dl>
        </div>

        <div className="bg-white border border-forest/10 rounded-xl p-6">
          <h2 className="font-semibold text-forest mb-4">Customer</h2>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <Detail label="Full Name" value={booking.customerInfo.fullName} />
            <Detail label="Email" value={booking.customerInfo.email} />
            <Detail label="Phone" value={booking.customerInfo.phone} />
            {booking.customerInfo.country && (
              <Detail label="Country" value={booking.customerInfo.country} />
            )}
          </dl>
        </div>

        <div className="bg-white border border-forest/10 rounded-xl p-6">
          <h2 className="font-semibold text-forest mb-4">Internal Notes</h2>
          {notes.length === 0 ? (
            <p className="text-sm text-forest/50 mb-4">No notes yet.</p>
          ) : (
            <ul className="space-y-2 mb-4 text-sm">
              {notes.map((note, i) => (
                <li key={i} className="bg-cream rounded-lg px-3 py-2 text-forest/80">
                  {note}
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add an internal note..."
              className="flex-1 border border-forest/20 rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleAddNote}
              disabled={saving || !newNote.trim()}
              className="bg-forest hover:bg-forest-dark disabled:opacity-50 text-cream text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveDetails} className="h-fit bg-white border border-forest/10 rounded-xl p-6 space-y-4 sticky top-24">
        <h3 className="font-semibold text-forest">{booking.bookingRef}</h3>

        <div>
          <label className="block text-sm font-medium text-forest mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingDetail["status"])}
            className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-forest mb-1">Amount Paid (KSh)</label>
          <input
            type="number"
            min={0}
            max={booking.totalAmount}
            value={amountPaid}
            onChange={(e) => setAmountPaid(Number(e.target.value))}
            className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>

       <div className="text-sm space-y-1 border-t border-forest/10 pt-3">
          {booking.priceBreakdown && (
            <div className="text-xs text-forest/50 space-y-0.5 pb-2">
              <div className="flex justify-between">
                <span>{booking.travelers.adults} × Adult</span>
                <span>KSh {booking.priceBreakdown.adultPrice.toLocaleString()} each</span>
              </div>
              {booking.travelers.children > 0 && (
                <div className="flex justify-between">
                  <span>{booking.travelers.children} × Child</span>
                  <span>KSh {booking.priceBreakdown.childPrice.toLocaleString()} each</span>
                </div>
              )}
              {!!booking.priceBreakdown.singleRoomSupplement && (
                <div className="flex justify-between">
                  <span>Single room</span>
                  <span>KSh {booking.priceBreakdown.singleRoomSupplement.toLocaleString()}</span>
                </div>
              )}
              {booking.priceBreakdown.seasonName && (
                <p className="italic pt-0.5">{booking.priceBreakdown.seasonName} pricing</p>
              )}
            </div>
          )}
          <div className="flex justify-between text-forest/70">
            <span>Total</span>
            <span>KSh {booking.totalAmount.toLocaleString()}</span>
          </div>

          </div>


        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-rust hover:bg-rust-dark disabled:opacity-60 text-cream font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-forest/50 text-xs uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-forest">{value}</dd>
    </div>
  );
}