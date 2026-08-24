import mongoose, { Schema, models, model } from "mongoose";

export type PaymentMethod = "mpesa" | "card" | "bank_transfer" | "paypal";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "partial"
  | "failed"
  | "refunded"
  | "cancelled";

export interface IPayment extends mongoose.Document {
  booking: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string; // e.g. M-Pesa receipt number
  mpesaCheckoutRequestId?: string; // for STK push reconciliation
  rawGatewayResponse?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["mpesa", "card", "bank_transfer", "paypal"], required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "partial", "failed", "refunded", "cancelled"],
      default: "pending",
      index: true,
    },
    transactionId: { type: String, index: true },
    mpesaCheckoutRequestId: { type: String, index: true },
    rawGatewayResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default models.Payment || model<IPayment>("Payment", PaymentSchema);
