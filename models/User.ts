import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "customer" | "staff";
// Staff sub-roles get enforced properly in Phase 4 (RBAC). For now we just
// tag staff accounts so admin routes can check `role === "staff"`.
export type StaffRole =
  | "super_admin"
  | "admin"
  | "booking_manager"
  | "tour_manager"
  | "finance"
  | "support_agent";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string; // bcrypt hash, never store plaintext
  phone?: string;
  country?: string;
  role: UserRole;
  staffRole?: StaffRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    country: { type: String, trim: true },
    role: { type: String, enum: ["customer", "staff"], default: "customer" },
    staffRole: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        "booking_manager",
        "tour_manager",
        "finance",
        "support_agent",
      ],
    },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
