import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Users } from "lucide-react";

export interface TourCardData {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  durationDays: number;
  maxGroupSize: number;
  adultPrice: number;
  description: string;
  badge?: string;
  tags: string[];
  destinationName?: string;
}

export default function TourCard({ tour }: { tour: TourCardData }) {
  return (
    <div className="bg-white rounded-xl border border-forest/10 shadow-sm overflow-hidden flex flex-col">
      <div className="relative h-56 torn-edge bg-mustard-light">
        {tour.image && (
          <Image
            src={tour.image}
            alt={tour.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        )}
        {tour.badge && (
          <span className="absolute top-3 left-3 bg-mustard text-forest text-xs font-bold uppercase px-3 py-1 rounded-full">
            {tour.badge}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-serif text-xl text-forest">{tour.name}</h3>
          <span className="text-rust font-semibold whitespace-nowrap">
            KSh {tour.adultPrice.toLocaleString()}
          </span>
        </div>

        {tour.destinationName && (
          <p className="flex items-center gap-1 text-xs text-forest/50 mb-2">
            <MapPin size={12} /> {tour.destinationName}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-forest/60 mb-3">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {tour.durationDays} Days
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> Max {tour.maxGroupSize}
          </span>
        </div>

        <p className="text-sm text-forest/70 mb-4 flex-1 line-clamp-3">
          {tour.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {tour.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-cream-dark text-forest/70 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/tours/${tour.slug}`}
          className="mt-auto bg-forest hover:bg-forest-dark text-cream text-center font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          View Itinerary
        </Link>
      </div>
    </div>
  );
}