import { z } from "zod";

export const ItineraryDaySchema = z.object({
  day: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const SeasonalPriceSchema = z
  .object({
    name: z.string().min(1, "Season name is required"),
    startDate: z.string().min(1, "Season start date is required"),
    endDate: z.string().min(1, "Season end date is required"),
    adultPrice: z.number().min(0),
    childPrice: z.number().min(0),
  })
  .refine((s) => new Date(s.endDate) >= new Date(s.startDate), {
    message: "Season end date must be on or after the start date",
    path: ["endDate"],
  });

export const AvailabilityDateSchema = z.object({
  date: z.string().min(1, "Departure date is required"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  status: z.enum(["open", "closed", "sold_out"]).default("open"),
  adultPriceOverride: z.number().min(0).optional(),
  childPriceOverride: z.number().min(0).optional(),
});

export const TourInputSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  destination: z.string().min(1, "Destination is required"),
  durationDays: z.number().int().min(1),
  durationNights: z.number().int().min(0),
  tourType: z.string().min(1, "Tour type is required"),
  difficulty: z.enum(["easy", "moderate", "challenging"]),
  maxGroupSize: z.number().int().min(1),
  minTravelers: z.number().int().min(1),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  badge: z.string().optional(),
  description: z.string().min(10, "Description is too short"),
  adultPrice: z.number().min(0),
  childPrice: z.number().min(0),
  singleRoomSupplement: z.number().min(0).optional(),
  seasonalPricing: z.array(SeasonalPriceSchema).default([]),
  availability: z.array(AvailabilityDateSchema).default([]),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  whatToBring: z.array(z.string()),
  images: z.array(z.string()),
  itinerary: z.array(ItineraryDaySchema),
});