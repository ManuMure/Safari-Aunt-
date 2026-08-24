import mongoose, { Schema, models, model } from "mongoose";

export interface IItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface ISeasonalPrice {
  name: string; // e.g. "Low Season", "Peak Season"
  startDate: Date;
  endDate: Date;
  adultPrice: number;
  childPrice: number;
}

export interface IAvailabilityDate {
  date: Date;
  capacity: number;
  booked: number;
  status: "open" | "closed" | "sold_out";
  // optional per-date price override, falls back to seasonal/base pricing
  adultPriceOverride?: number;
  childPriceOverride?: number;
}

export interface ITour extends mongoose.Document {
  name: string;
  slug: string;
  destination: mongoose.Types.ObjectId;
  durationDays: number;
  durationNights: number;
  tourType: string; // e.g. "Safari", "Beach", "City Tour"
  difficulty: "easy" | "moderate" | "challenging";
  maxGroupSize: number;
  minTravelers: number;
  featured: boolean;
  published: boolean;
  badge?: string; // e.g. "Bestseller", "Family Friendly" — shown as a card overlay

  itinerary: IItineraryDay[];

  pricing: {
    adultPrice: number;
    childPrice: number;
    singleRoomSupplement?: number;
    seasonalPricing: ISeasonalPrice[];
  };

  availability: IAvailabilityDate[];

  inclusions: string[];
  exclusions: string[];
  whatToBring: string[];
  cancellationPolicy?: string;

  images: string[];
  description: string;

  createdAt: Date;
  updatedAt: Date;
}

const ItineraryDaySchema = new Schema<IItineraryDay>(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const SeasonalPriceSchema = new Schema<ISeasonalPrice>(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    adultPrice: { type: Number, required: true },
    childPrice: { type: Number, required: true },
  },
  { _id: false }
);

const AvailabilityDateSchema = new Schema<IAvailabilityDate>(
  {
    date: { type: Date, required: true },
    capacity: { type: Number, required: true },
    booked: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["open", "closed", "sold_out"],
      default: "open",
    },
    adultPriceOverride: { type: Number },
    childPriceOverride: { type: Number },
  },
  { _id: false }
);

const TourSchema = new Schema<ITour>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true, index: true },
    durationDays: { type: Number, required: true },
    durationNights: { type: Number, required: true },
    tourType: { type: String, required: true, index: true },
    difficulty: { type: String, enum: ["easy", "moderate", "challenging"], default: "easy" },
    maxGroupSize: { type: Number, required: true },
    minTravelers: { type: Number, default: 1 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    badge: { type: String },

    itinerary: [ItineraryDaySchema],

    pricing: {
      adultPrice: { type: Number, required: true },
      childPrice: { type: Number, required: true },
      singleRoomSupplement: { type: Number },
      seasonalPricing: [SeasonalPriceSchema],
    },

    availability: [AvailabilityDateSchema],

    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    whatToBring: [{ type: String }],
    cancellationPolicy: { type: String },

    images: [{ type: String }],
    description: { type: String, required: true },
  },
  { timestamps: true }
);

TourSchema.index({ tourType: 1, "pricing.adultPrice": 1 });

export default models.Tour || model<ITour>("Tour", TourSchema);
