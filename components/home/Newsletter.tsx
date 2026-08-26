"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("submitting");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }

      setStatus("done");
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16 text-center">
      <Mail size={28} className="text-rust mx-auto mb-3" />
      <h2 className="font-serif text-3xl text-forest mb-2">
        Stay in the Story
      </h2>
      <p className="text-forest/70 mb-6">
        New destinations, seasonal offers, and travel inspiration — straight
        to your inbox, occasionally.
      </p>

      {status === "done" ? (
        <p className="text-forest font-semibold">
          You&rsquo;re subscribed. Welcome aboard!
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 border border-forest/20 rounded-lg px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="bg-forest hover:bg-forest-dark disabled:opacity-60 text-cream font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
          >
            {status === "submitting" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </section>
  );
}