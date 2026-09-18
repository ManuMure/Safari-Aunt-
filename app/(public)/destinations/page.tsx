import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Destination from "@/models/Destination";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destinations | Safari Aunt Expedition",
  description:
    "Explore the destinations behind every Safari Aunt Expedition journey — from golden savannas to misty highlands.",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function DestinationsPage() {
  await connectDB();

  const destinations = await Destination.find({ published: true })
    .sort({ country: 1, region: 1, name: 1 })
    .lean<any[]>();

  // Group destinations: country -> region (or "General" if none) -> destinations[]
  const byCountry = new Map<string, Map<string, any[]>>();

  for (const dest of destinations) {
    const regionKey =
      (dest.region as string | undefined)?.trim() || "General";

    if (!byCountry.has(dest.country)) {
      byCountry.set(dest.country, new Map());
    }

    const regions = byCountry.get(dest.country)!;

    if (!regions.has(regionKey)) {
      regions.set(regionKey, []);
    }

    regions.get(regionKey)!.push(dest);
  }

  const countries = Array.from(byCountry.keys()).sort();

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

      {countries.length === 0 ? (
        <p className="text-forest/60 text-center py-16">
          No destinations published yet.
        </p>
      ) : (
        <>
          {/* Quick-jump country nav — only useful once there's more than one country */}
          {countries.length > 1 && (
            <div className="bg-cream-dark/60 border-y border-forest/10">
              <div className="mx-auto max-w-6xl px-6 py-3 flex gap-2 overflow-x-auto">
                {countries.map((country) => (
                  <Link
                    key={country}
                    href={`#${slugify(country)}`}
                    className="shrink-0 text-xs font-semibold uppercase tracking-wide text-forest/70 hover:text-rust bg-white border border-forest/10 px-4 py-2 rounded-full transition-colors"
                  >
                    {country}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mx-auto max-w-6xl px-6 py-12 space-y-16">
            {countries.map((country) => {
              const regions = byCountry.get(country)!;

              const regionNames = Array.from(regions.keys()).sort((a, b) => {
                if (a === "General") return 1;
                if (b === "General") return -1;
                return a.localeCompare(b);
              });

              const countryTotal = Array.from(regions.values()).reduce(
                (sum, list) => sum + list.length,
                0
              );

              return (
                <section
                  key={country}
                  id={slugify(country)}
                  className="scroll-mt-28"
                >
                  <div className="flex items-baseline justify-between mb-6 pb-3 border-b-2 border-forest/10">
                    <h2 className="font-serif text-2xl md:text-3xl text-forest">
                      {country}
                    </h2>

                    <span className="text-xs text-forest/50 uppercase tracking-wide">
                      {countryTotal} destination
                      {countryTotal !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {regionNames.map((regionName) => (
                    <div key={regionName} className="mb-10 last:mb-0">
                      {regionName !== "General" && (
                        <h3 className="text-sm font-semibold text-rust uppercase tracking-wide mb-4">
                          {regionName}
                        </h3>
                      )}

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regions.get(regionName)!.map((dest) => (
                          <Link
                            key={dest._id.toString()}
                            href={`/destinations/${dest.slug}`}
                            className="bg-white rounded-xl border border-forest/10 shadow-sm overflow-hidden group"
                          >
                            <div className="relative h-48 torn-edge bg-mustard-light">
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
                              <h4 className="font-serif text-xl text-forest mb-1">
                                {dest.name}
                              </h4>

                              <p className="text-xs text-forest/50 uppercase tracking-wide mb-2">
                                {dest.country}
                              </p>

                              <p className="text-sm text-forest/70 line-clamp-2">
                                {dest.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}