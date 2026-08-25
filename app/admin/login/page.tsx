"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setSubmitting(false);
        return;
      }

      if (data.role !== "staff") {
        // A customer account tried to log into the admin panel — clear the
        // session that was just created rather than leaving them signed in.
        await fetch("/api/auth/logout", { method: "POST" });
        setError("This login is for staff accounts only.");
        setSubmitting(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm bg-white border border-forest/10 rounded-xl p-8">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Safari Aunt Expedition"
            width={64}
            height={64}
            className="rounded-lg"
          />
        </div>
        <h1 className="font-serif text-2xl text-forest text-center mb-6">
          Staff Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-forest mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-forest mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-forest/20 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-forest hover:bg-forest-dark disabled:opacity-60 text-cream font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}