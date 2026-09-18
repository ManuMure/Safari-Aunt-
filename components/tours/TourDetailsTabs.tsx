"use client";

import { useState } from "react";
import { Check, Info, X } from "lucide-react";

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

interface TourDetailTabsProps {
  description: string;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  whatToBring: string[];
  cancellationPolicy?: string;
}

const ALL_TABS = ["Overview", "Itinerary", "Inclusions", "Good to Know"] as const;
type Tab = (typeof ALL_TABS)[number];

export default function TourDetailTabs({
  description,
  itinerary,
  inclusions,
  exclusions,
  whatToBring,
  cancellationPolicy,
}: TourDetailTabsProps) {
  // Only show tabs that actually have content for this tour — no empty panels.
  const tabs = ALL_TABS.filter((tab) => {
    if (tab === "Itinerary") return itinerary.length > 0;
    if (tab === "Inclusions") return inclusions.length > 0 || exclusions.length > 0;
    if (tab === "Good to Know") return whatToBring.length > 0 || !!cancellationPolicy;
    return true; // Overview always shows
  });

  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]);

  return (
    <div>
      <div className="flex gap-1 border-b border-forest/10 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? "text-rust border-rust"
                : "text-forest/50 border-transparent hover:text-forest"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <p className="text-forest/70 leading-relaxed">{description}</p>
      )}

      {activeTab === "Itinerary" && (
        <div className="space-y-6">
          {itinerary.map((day) => (
            <div key={day.day} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center font-semibold text-sm">
                {day.day}
              </div>
              <div>
                <h3 className="font-semibold text-forest mb-1">{day.title}</h3>
                <p className="text-sm text-forest/70">{day.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Inclusions" && (
        <div className="grid sm:grid-cols-2 gap-8">
          {inclusions.length > 0 && (
            <div>
              <h3 className="font-semibold text-forest mb-3">What&rsquo;s Included</h3>
              <ul className="space-y-2 text-sm text-forest/70">
                {inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={16} className="text-forest mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {exclusions.length > 0 && (
            <div>
              <h3 className="font-semibold text-forest mb-3">Not Included</h3>
              <ul className="space-y-2 text-sm text-forest/70">
                {exclusions.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <X size={16} className="text-rust mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === "Good to Know" && (
        <div className="space-y-8">
          {whatToBring.length > 0 && (
            <div>
              <h3 className="font-semibold text-forest mb-3">What to Bring</h3>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-forest/70">
                {whatToBring.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={16} className="text-forest mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cancellationPolicy && (
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-forest mb-3">
                <Info size={16} /> Cancellation Policy
              </h3>
              <p className="text-sm text-forest/70 leading-relaxed">
                {cancellationPolicy}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}