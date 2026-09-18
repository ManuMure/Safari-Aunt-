"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function VerifyEmailBanner({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
      <Mail size={20} className="text-amber-700 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-amber-900 font-medium">Please verify your email</p>
        <p className="text-sm text-amber-800/80 mt-0.5">
          We sent a verification link to {email}. Check your inbox to activate your
          account.
        </p>

        {status === "sent" ? (
          <p className="text-sm text-amber-900 font-medium mt-2">
            Verification email sent — check your inbox.
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={status === "sending"}
            className="text-sm font-semibold text-amber-900 underline underline-offset-2 mt-2 disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Resend verification email"}
          </button>
        )}

        {error && <p className="text-sm text-red-700 mt-2">{error}</p>}
      </div>
    </div>
  );
}