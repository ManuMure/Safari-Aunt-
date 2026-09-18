"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Status = "verifying" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("Confirming your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing a token.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "This link is invalid or has expired.");
          return;
        }
        setStatus("success");
        setMessage(data.message || "Email verified successfully.");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, [token]);

  return (
    <div className="w-full max-w-sm bg-white border border-forest/10 rounded-xl p-8 text-center">
      {status === "verifying" && (
        <>
          <Loader2 size={40} className="text-forest mx-auto mb-3 animate-spin" />
          <h1 className="font-serif text-xl text-forest mb-2">Verifying…</h1>
          <p className="text-forest/70 text-sm">{message}</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle2 size={40} className="text-forest mx-auto mb-3" />
          <h1 className="font-serif text-xl text-forest mb-2">Email Verified</h1>
          <p className="text-forest/70 text-sm mb-6">{message}</p>
          <Link
            href="/account"
            className="inline-block bg-forest text-cream px-5 py-2 rounded-lg text-sm font-semibold hover:bg-forest/90"
          >
            Go to your account
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle size={40} className="text-rust mx-auto mb-3" />
          <h1 className="font-serif text-xl text-forest mb-2">Verification Failed</h1>
          <p className="text-forest/70 text-sm mb-6">{message}</p>
          <Link
            href="/account"
            className="inline-block bg-forest text-cream px-5 py-2 rounded-lg text-sm font-semibold hover:bg-forest/90"
          >
            Go to your account
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-6 py-16">
      <Suspense
        fallback={
          <div className="w-full max-w-sm bg-white border border-forest/10 rounded-xl p-8 text-center">
            <Loader2 size={40} className="text-forest mx-auto mb-3 animate-spin" />
            <p className="text-forest/70 text-sm">Loading…</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}