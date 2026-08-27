import { z } from "zod";

export const ItineraryDaySchema = z.object({
  day: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
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
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  whatToBring: z.array(z.string()),
  images: z.array(z.string()),
  itinerary: z.array(ItineraryDaySchema),
});