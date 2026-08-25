import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Destination from "@/models/Destination";

export const dynamic = "force-dynamic";

export default async function DestinationsPage() {
  await connectDB();
  const destinations = await Destination.find({ published: true })
    .sort({ name: 1 })
    .lean<any[]>();

  return (
    <main>
      <section className="text-center pt-16 pb-4 px-6">
        <h1 className="font-serif text-4xl md:text-5xl text-forest mb-3">
          Destinations
        </h1>
        <p className="text-rust max-w-xl mx-auto">
          From golden savannas to misty highlands — explore the places
          behind every journey we craft.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.length === 0 && (
          <p className="text-forest/60 col-span-full text-center py-16">
            No destinations published yet.
          </p>
        )}
        {destinations.map((dest) => (
          <Link
            key={dest._id.toString()}
            href={`/destinations/${dest.slug}`}
            className="bg-white rounded-xl border border-forest/10 shadow-sm overflow-hidden group"
          >
            <div className="relative h-48 bg-mustard-light">
              {dest.coverImage && (
                <Image
                  src={dest.coverImage}
                  alt={dest.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
            <div className="p-5">
              <h2 className="font-serif text-xl text-forest mb-1">{dest.name}</h2>
              <p className="text-xs text-forest/50 uppercase tracking-wide mb-2">
                {dest.country}
              </p>
              <p className="text-sm text-forest/70 line-clamp-2">{dest.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}