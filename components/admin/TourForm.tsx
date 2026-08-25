"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface DestinationOption {
  _id: string;
  name: string;
  country: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface TourFormValues {
  name: string;
  slug: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  tourType: string;
  difficulty: "easy" | "moderate" | "challenging";
  maxGroupSize: number;
  minTravelers: number;
  featured: boolean;
  published: boolean;
  badge: string;
  description: string;
  adultPrice: number;
  childPrice: number;
  singleRoomSupplement: number | "";
  inclusions: string;
  exclusions: string;
  whatToBring: string;
  images: string;
  itinerary: ItineraryDay[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const EMPTY_VALUES: TourFormValues = {
  name: "",
  slug: "",
  destination: "",
  durationDays: 1,
  durationNights: 0,
  tourType: "",
  difficulty: "easy",
  maxGroupSize: 8,
  minTravelers: 1,
  featured: false,
  published: false,
  badge: "",
  description: "",
  adultPrice: 0,
  childPrice: 0,
  singleRoomSupplement: "",
  inclusions: "",
  exclusions: "",
  whatToBring: "",
  images: "",
  itinerary: [],
};

interface TourFormProps {
  mode: "create" | "edit";
  tourId?: string;
  destinations: DestinationOption[];
  initialValues?: TourFormValues;
}

export default function TourForm({
  mode,
  tourId,
  destinations,
  initialValues,
}: TourFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<TourFormValues>(initialValues ?? EMPTY_VALUES);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof TourFormValues>(key: K, value: TourFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    update("name", name);
    if (!slugTouched) {
      update("slug", slugify(name));
    }
  }

  function addItineraryDay() {
    update("itinerary", [
      ...values.itinerary,
      { day: values.itinerary.length + 1, title: "", description: "" },
    ]);
  }

  function updateItineraryDay(index: number, field: keyof ItineraryDay, value: string | number) {
    const next = [...values.itinerary];
    next[index] = { ...next[index], [field]: value };
    update("itinerary", next);
  }

  function removeItineraryDay(index: number) {
    update(
      "itinerary",
      values.itinerary.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 }))
    );
  }

  function linesToArray(text: string) {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      name: values.name,
      slug: values.slug,
      destination: values.destination,
      durationDays: Number(values.durationDays),
      durationNights: Number(values.durationNights),
      tourType: values.tourType,
      difficulty: values.difficulty,
      maxGroupSize: Number(values.maxGroupSize),
      minTravelers: Number(values.minTravelers),
      featured: values.featured,
      published: values.published,
      badge: values.badge || undefined,
      description: values.description,
      adultPrice: Number(values.adultPrice),
      childPrice: Number(values.childPrice),
      singleRoomSupplement:
        values.singleRoomSupplement === "" ? undefined : Number(values.singleRoomSupplement),
      inclusions: linesToArray(values.inclusions),
      exclusions: linesToArray(values.exclusions),
      whatToBring: linesToArray(values.whatToBring),
      images: linesToArray(values.images),
      itinerary: values.itinerary,
    };

    try {
      const url = mode === "create" ? "/api/admin/tours" : `/api/admin/tours/${tourId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push("/admin/tours");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl">
      <section className="space-y-4">
        <h2 className="font-serif text-xl text-forest">Basic Information</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Tour Name">
            <input
              type="text"
              required
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Slug (URL)">
            <input
              type="text"
              required
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
              className="input"
            />
          </Field>

          <Field label="Destination">
            <select
              required
              value={values.destination}
              onChange={(e) => update("destination", e.target.value)}
              className="input"
            >
              <option value="">Select a destination</option>
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}, {d.country}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tour Type">
            <input
              type="text"
              required
              placeholder="e.g. Savanna Safari"
              value={values.tourType}
              onChange={(e) => update("tourType", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Duration (Days)">
            <input
              type="number"
              min={1}
              required
              value={values.durationDays}
              onChange={(e) => update("durationDays", Number(e.target.value))}
              className="input"
            />
          </Field>

          <Field label="Duration (Nights)">
            <input
              type="number"
              min={0}
              required
              value={values.durationNights}
              onChange={(e) => update("durationNights", Number(e.target.value))}
              className="input"
            />
          </Field>

          <Field label="Max Group Size">
            <input
              type="number"
              min={1}
              required
              value={values.maxGroupSize}
              onChange={(e) => update("maxGroupSize", Number(e.target.value))}
              className="input"
            />
          </Field>

          <Field label="Min Travelers">
            <input
              type="number"
              min={1}
              required
              value={values.minTravelers}
              onChange={(e) => update("minTravelers", Number(e.target.value))}
              className="input"
            />
          </Field>

          <Field label="Difficulty">
            <select
              value={values.difficulty}
              onChange={(e) => update("difficulty", e.target.value as TourFormValues["difficulty"])}
              className="input"
            >
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
            </select>
          </Field>

          <Field label="Badge (optional)">
            <input
              type="text"
              placeholder="e.g. Bestseller"
              value={values.badge}
              onChange={(e) => update("badge", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm text-forest">
            <input
              type="checkbox"
              checked={values.published}
              onChange={(e) => update("published", e.target.checked)}
              className="accent-forest"
            />
            Published (visible on the public site)
          </label>
          <label className="flex items-center gap-2 text-sm text-forest">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="accent-forest"
            />
            Featured
          </label>
        </div>

        <Field label="Description">
          <textarea
            required
            rows={4}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            className="input"
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl text-forest">Pricing</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Adult Price (KSh)">
            <input
              type="number"
              min={0}
              required
              value={values.adultPrice}
              onChange={(e) => update("adultPrice", Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Child Price (KSh)">
            <input
              type="number"
              min={0}
              required
              value={values.childPrice}
              onChange={(e) => update("childPrice", Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Single Room Supplement (optional)">
            <input
              type="number"
              min={0}
              value={values.singleRoomSupplement}
              onChange={(e) =>
                update("singleRoomSupplement", e.target.value === "" ? "" : Number(e.target.value))
              }
              className="input"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl text-forest">Itinerary</h2>
        <div className="space-y-4">
          {values.itinerary.map((day, i) => (
            <div key={i} className="bg-white border border-forest/10 rounded-lg p-4 flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-forest text-cream flex items-center justify-center text-sm font-semibold">
                {day.day}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Day title"
                  value={day.title}
                  onChange={(e) => updateItineraryDay(i, "title", e.target.value)}
                  className="input"
                />
                <textarea
                  placeholder="Day description"
                  rows={2}
                  value={day.description}
                  onChange={(e) => updateItineraryDay(i, "description", e.target.value)}
                  className="input"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItineraryDay(i)}
                className="shrink-0 text-red-500 hover:text-red-700"
                aria-label="Remove day"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItineraryDay}
          className="flex items-center gap-2 text-sm font-semibold text-forest hover:text-forest-dark"
        >
          <Plus size={16} /> Add Day
        </button>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl text-forest">Details</h2>
        <p className="text-xs text-forest/50 -mt-2">One item per line for the fields below.</p>

        <Field label="Inclusions">
          <textarea
            rows={3}
            value={values.inclusions}
            onChange={(e) => update("inclusions", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Exclusions">
          <textarea
            rows={3}
            value={values.exclusions}
            onChange={(e) => update("exclusions", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="What to Bring">
          <textarea
            rows={3}
            value={values.whatToBring}
            onChange={(e) => update("whatToBring", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Image URLs">
          <textarea
            rows={2}
            value={values.images}
            onChange={(e) => update("images", e.target.value)}
            className="input"
          />
        </Field>
      </section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-rust hover:bg-rust-dark disabled:opacity-60 text-cream font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {submitting ? "Saving..." : mode === "create" ? "Create Tour" : "Save Changes"}
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(31, 66, 46, 0.2);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          background: white;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-forest mb-1">{label}</label>
      {children}
    </div>
  );
}