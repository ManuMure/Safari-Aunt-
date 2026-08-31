import mongoose, { Schema, models, model } from "mongoose";

export interface INewsletterSubscriber extends mongoose.Document {
  email: string;
  createdAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.NewsletterSubscriber ||
  model<INewsletterSubscriber>("NewsletterSubscriber", NewsletterSubscriberSchema);