import mongoose, { Schema, models, model } from "mongoose";

export interface IDestination extends mongoose.Document {
  name: string;
  slug: string;
  country: string;
  region?: string;
  description: string;
  coverImage: string;
  gallery: string[];
  attractions: string[];
  bestTimeToVisit?: string;
  activities: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DestinationSchema = new Schema<IDestination>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    country: { type: String, required: true, index: true },
    region: { type: String },
    description: { type: String, required: true },
    coverImage: { type: String, required: true },
    gallery: [{ type: String }],
    attractions: [{ type: String }],
    bestTimeToVisit: { type: String },
    activities: [{ type: String }],
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Destination ||
  model<IDestination>("Destination", DestinationSchema);
