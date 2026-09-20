"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  name: string;
  phone?: string;
  country?: string;
}

export default function ProfileForm({ name, phone, country }: ProfileFormProps) {
  const router = useRouter();
  const [values, setValues] = useState({
    name,
    phone: phone ?? "",
    country: country ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSaved(true);
      setSubmitting(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-forest/10 rounded-xl p-6 space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-forest mb-1">Full Name</label>
          <input
            type="text"
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-forest mb-1">Phone</label>
          <input
            type="tel"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-forest mb-1">Country</label>
          <input
            type="text"
            value={values.country}
            onChange={(e) => setValues((v) => ({ ...v, country: e.target.value }))}
            className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      {saved && <p className="text-sm text-forest">Profile updated.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-forest hover:bg-forest-dark disabled:opacity-60 text-cream font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
      >
        {submitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}