import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Destination from "@/models/Destination";

export default async function FeaturedDestinations() {
  await connectDB();

  const destinations = await Destination.find({ featured: true, published: true })
    .limit(3)
    .lean<any[]>();

  if (destinations.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl text-forest mb-2">
            Featured Destinations
          </h2>
          <p className="text-forest/70">Where every story begins.</p>
        </div>
        <Link
          href="/destinations"
          className="text-rust font-semibold hover:underline whitespace-nowrap"
        >
          Explore All →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest) => (
          <Link
            key={dest._id.toString()}
            href={`/destinations/${dest.slug}`}
            className="relative h-64 rounded-xl overflow-hidden group bg-mustard-light"
          >
            {dest.coverImage && (
              <Image
                src={dest.coverImage}
                alt={dest.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-forest/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="font-serif text-xl text-cream">{dest.name}</h3>
              <p className="text-cream/80 text-sm">{dest.country}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}