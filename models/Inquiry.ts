import mongoose, { Schema, models, model } from "mongoose";

export type InquiryStatus = "new" | "read" | "responded";

export interface IInquiry extends mongoose.Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "read", "responded"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

export default models.Inquiry || model<IInquiry>("Inquiry", InquirySchema);