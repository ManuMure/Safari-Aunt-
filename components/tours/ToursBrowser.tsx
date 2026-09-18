"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import TourCard, { TourCardData } from "./TourCard";

export interface TourListItem extends TourCardData {
  tourType: string;
  difficulty: string;
  destinationName: string;
}

const DIFFICULTY_OPTIONS = ["easy", "moderate", "challenging"] as const;

export default function ToursBrowser({
  tours,
  initialQuery = "",
}: {
  tours: TourListItem[];
  initialQuery?: string;
}) {
  const tourTypes = useMemo(
    () => Array.from(new Set(tours.map((t) => t.tourType))),
    [tours]
  );

  const destinations = useMemo(
    () => Array.from(new Set(tours.map((t) => t.destinationName))).sort(),
    [tours]
  );

  const prices = tours.map((t) => t.adultPrice);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const [search, setSearch] = useState(initialQuery);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [destination, setDestination] = useState("any");
  const [difficulty, setDifficulty] = useState("any");
  const [duration, setDuration] = useState("any");
  const [maxPriceFilter, setMaxPriceFilter] = useState(maxPrice);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const filtered = tours.filter((tour) => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matches =
        tour.name.toLowerCase().includes(q) ||
        tour.description.toLowerCase().includes(q) ||
        tour.tourType.toLowerCase().includes(q) ||
        tour.destinationName.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (selectedTypes.length && !selectedTypes.includes(tour.tourType)) return false;
    if (destination !== "any" && tour.destinationName !== destination) return false;
    if (difficulty !== "any" && tour.difficulty !== difficulty) return false;
    if (duration === "short" && tour.durationDays > 3) return false;
    if (duration === "medium" && (tour.durationDays < 4 || tour.durationDays > 7)) return false;
    if (duration === "long" && tour.durationDays < 8) return false;
    if (tour.adultPrice > maxPriceFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-[280px_1fr] gap-8">
      <aside className="bg-white border border-forest/10 rounded-xl p-6 h-fit">
        <h3 className="flex items-center gap-2 font-semibold text-forest mb-6">
          <SlidersHorizontal size={18} /> Refine Your Story
        </h3>

        {destinations.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-forest mb-3">Destination</p>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm text-forest/80 bg-white"
            >
              <option value="any">All Destinations</option>
              {destinations.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        {tourTypes.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-forest mb-3">
              Destination Type
            </p>
            <div className="space-y-2">
              {tourTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-sm text-forest/80"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    className="accent-forest"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm font-semibold text-forest mb-3">Difficulty</p>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm text-forest/80 bg-white"
          >
            <option value="any">Any Difficulty</option>
            {DIFFICULTY_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-forest mb-3">Duration</p>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm text-forest/80 bg-white"
          >
            <option value="any">Any Duration</option>
            <option value="short">1–3 Days</option>
            <option value="medium">4–7 Days</option>
            <option value="long">8+ Days</option>
          </select>
        </div>

        {maxPrice > 0 && (
          <div>
            <p className="text-sm font-semibold text-forest mb-3">
              Price Range
            </p>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="w-full accent-forest"
            />
            <div className="flex justify-between text-xs text-forest/60 mt-1">
              <span>KSh {minPrice.toLocaleString()}</span>
              <span>KSh {maxPriceFilter.toLocaleString()}</span>
            </div>
          </div>
        )}
      </aside>

      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tours by name, type, or keyword..."
          className="w-full border border-forest/20 rounded-lg px-4 py-2.5 text-sm mb-6 bg-white"
        />
        <div className="grid sm:grid-cols-2 gap-6">
          {filtered.length === 0 && (
            <p className="text-forest/60 col-span-full text-center py-16">
              No tours match those filters yet.
            </p>
          )}
          {filtered.map((tour) => (
            <TourCard key={tour._id} tour={tour} />
          ))}
        </div>
      </div>
    </div>
  );
}