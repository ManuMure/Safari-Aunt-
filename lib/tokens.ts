import crypto from "crypto";

export const VERIFICATION_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
export const VERIFICATION_RESEND_COOLDOWN_MS = 1000 * 60; // 60 seconds

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}