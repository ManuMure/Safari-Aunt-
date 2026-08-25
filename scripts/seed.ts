/**
 * Run with: npm run seed
 * Creates a super_admin staff account so you can log in and test
 * the auth flow before the admin dashboard UI exists in Phase 1.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Destination from "../models/Destination";
import Tour from "../models/Tour";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set — check .env.local");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const email = "admin@travelagency.test";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log("Super admin already exists:", email);
  } else {
    const password = await bcrypt.hash("ChangeMe123!", 12);
    await User.create({
      name: "Super Admin",
      email,
      password,
      role: "staff",
      staffRole: "super_admin",
      emailVerified: true,
    });
    console.log("Created super admin:");
    console.log("  email:", email);
    console.log("  password: ChangeMe123!  (change this immediately)");
  }

  // --- Sample destinations + tours, just so pages aren't empty before the
  // admin dashboard exists. Safe to delete these documents later from
  // MongoDB Atlas once you're managing real content through the admin panel. ---
  const sampleDestinations = [
  {
    name: "Serengeti",
    slug: "serengeti",
    country: "Tanzania",
    description: "Endless golden plains and the great migration.",
    coverImage: "https://picsum.photos/seed/serengeti-dest/1200/600",
    bestTimeToVisit: "June to September, for the great migration",
    activities: ["Game Drives", "Hot Air Balloon Safari", "Photography"],
    featured: true,
    published: true,
  },
  {
    name: "Kenyan Highlands",
    slug: "kenyan-highlands",
    country: "Kenya",
    description: "Mist-shrouded peaks, ideal for a slower, restorative trip.",
    coverImage: "https://picsum.photos/seed/highlands-dest/1200/600",
    bestTimeToVisit: "January to March, for clear skies",
    activities: ["Trekking", "Birdwatching", "Wellness Retreats"],
    featured: true,
    published: true,
  },
  {
    name: "Okavango Delta",
    slug: "okavango-delta",
    country: "Botswana",
    description: "Lily-covered waterways navigated by traditional mokoro canoe.",
    coverImage: "https://picsum.photos/seed/okavango-dest/1200/600",
    bestTimeToVisit: "July to October, dry season",
    activities: ["Mokoro Canoe Trips", "Birdwatching", "Fishing"],
    featured: true,
    published: true,
  },
];

  const destinationDocs: Record<string, mongoose.Types.ObjectId> = {};
  for (const dest of sampleDestinations) {
    const doc = await Destination.findOneAndUpdate(
      { slug: dest.slug },
      dest,
      { upsert: true, new: true }
    );
    destinationDocs[dest.slug] = doc._id;
  }

 const sampleTours = [
  {
    name: "7-Day Serengeti Spirit",
    slug: "7-day-serengeti-spirit",
    destination: destinationDocs["serengeti"],
    durationDays: 7,
    durationNights: 6,
    tourType: "Savanna Safari",
    maxGroupSize: 6,
    minTravelers: 1,
    badge: "Bestseller",
    published: true,
    description:
      "Immerse yourself in the rhythm of the great migration. This intimate journey blends luxury camping with raw wilderness encounters.",
    pricing: { adultPrice: 3200 * 130, childPrice: 2000 * 130, seasonalPricing: [] },
    itinerary: [
      { day: 1, title: "Arrival & Nairobi Transfer", description: "Airport pickup, hotel check-in, welcome dinner briefing on the days ahead." },
      { day: 2, title: "Into the Serengeti", description: "Scenic drive into the park, afternoon game drive as the light turns gold." },
      { day: 3, title: "The Great Migration", description: "Full day following migration herds across the plains, packed lunch en route." },
    ],
    inclusions: ["Luxury tented accommodation", "All park fees", "Professional guide", "Airport transfers", "Full board meals"],
    exclusions: ["International flights", "Travel insurance", "Personal expenses", "Gratuities"],
    whatToBring: [],
    images: ["https://picsum.photos/seed/serengeti-spirit/800/600"],
  },
  {
    name: "Highland Cloud Retreat",
    slug: "highland-cloud-retreat",
    destination: destinationDocs["kenyan-highlands"],
    durationDays: 5,
    durationNights: 4,
    tourType: "Highland Trek",
    maxGroupSize: 4,
    minTravelers: 1,
    published: true,
    description:
      "A restorative escape into the mist-shrouded peaks. Focus on wellness, gentle treks, and reconnecting with nature's quiet side.",
    pricing: { adultPrice: 2850 * 130, childPrice: 1800 * 130, seasonalPricing: [] },
    itinerary: [
      { day: 1, title: "Arrival in the Highlands", description: "Transfer to the lodge, gentle orientation walk as the mist rolls in." },
      { day: 2, title: "Peak Trekking Day", description: "Guided trek through cloud forest trails, stopping for a viewpoint picnic." },
    ],
    inclusions: ["Boutique lodge accommodation", "Daily guided treks", "All meals", "Wellness sessions"],
    exclusions: ["Flights", "Travel insurance", "Personal expenses"],
    whatToBring: [],
    images: ["https://picsum.photos/seed/highland-cloud/800/600"],
  },
  {
    name: "Delta Waterways Discovery",
    slug: "delta-waterways-discovery",
    destination: destinationDocs["okavango-delta"],
    durationDays: 10,
    durationNights: 9,
    tourType: "Wetland Safari",
    maxGroupSize: 8,
    minTravelers: 1,
    badge: "Family Friendly",
    published: true,
    description:
      "Navigate serene, lily-covered channels by mokoro. A peaceful yet thrilling exploration perfect for multi-generational travelers.",
    pricing: { adultPrice: 4100 * 130, childPrice: 2600 * 130, seasonalPricing: [] },
    itinerary: [
      { day: 1, title: "Arrival at the Delta", description: "Light aircraft transfer to camp, sundowner cruise on arrival." },
      { day: 2, title: "Mokoro Exploration", description: "Traditional canoe excursion through the channels, birdwatching along the way." },
    ],
    inclusions: ["Tented camp accommodation", "Mokoro excursions", "All meals", "Light aircraft transfers"],
    exclusions: ["International flights", "Travel insurance", "Visa fees"],
    whatToBring: [],
    images: ["https://picsum.photos/seed/delta-waterways/800/600"],
  },
];

  for (const tour of sampleTours) {
    await Tour.findOneAndUpdate({ slug: tour.slug }, tour, {
      upsert: true,
      new: true,
    });
  }
  console.log(`Seeded ${sampleDestinations.length} destinations and ${sampleTours.length} tours`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});