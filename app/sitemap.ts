import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Tour from "@/models/Tour";
import Destination from "@/models/Destination";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  await connectDB();

  const [tours, destinations] = await Promise.all([
    Tour.find({ published: true }).select("slug updatedAt").lean<any[]>(),
    Destination.find({ published: true }).select("slug updatedAt").lean<any[]>(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/tours`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/destinations`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const tourRoutes: MetadataRoute.Sitemap = tours.map((t) => ({
    url: `${siteUrl}/tours/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const destinationRoutes: MetadataRoute.Sitemap = destinations.map((d) => ({
    url: `${siteUrl}/destinations/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...tourRoutes, ...destinationRoutes];
}