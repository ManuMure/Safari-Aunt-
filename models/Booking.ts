import mongoose, { Schema, models, model } from "mongoose";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface IBooking extends mongoose.Document {
  bookingRef: string; // e.g. TRV-2026-00482
  customer?: mongoose.Types.ObjectId; // ref User, optional for guest checkout
  tour: mongoose.Types.ObjectId;
  travelDate: Date;

  travelers: {
    adults: number;
    children: number;
  };

  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    country?: string;
  };

  specialRequests?: string;
  emergencyContact?: string;

  totalAmount: number;
  amountPaid: number;

  status: BookingStatus;

  internalNotes: string[];

  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingRef: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User" },
    tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true, index: true },
    travelDate: { type: Date, required: true },

    travelers: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0 },
    },

    customerInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      country: { type: String },
    },

    specialRequests: { type: String },
    emergencyContact: { type: String },

    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },

    internalNotes: [{ type: String }],
  },
  { timestamps: true }
);

/**
 * Auto-generate a human-readable booking reference like TRV-2026-00001
 * the first time a booking is saved.
 */
BookingSchema.pre("validate", async function (next) {
  if (this.bookingRef) return next();

  const year = new Date().getFullYear();
  const BookingModel = models.Booking || model<IBooking>("Booking", BookingSchema);
  const count = await BookingModel.countDocuments({
    createdAt: { $gte: new Date(`${year}-01-01`) },
  });
  this.bookingRef = `TRV-${year}-${String(count + 1).padStart(5, "0")}`;
  next();
});

export default models.Booking || model<IBooking>("Booking", BookingSchema);
