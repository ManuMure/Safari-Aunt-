"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 text-center font-sans">
        <h1 className="font-serif text-3xl text-forest mb-3">
          Something Went Wrong
        </h1>
        <p className="text-forest/70 max-w-md mb-8">
          We hit a snag on our end. Please try again, or head back home if
          the problem continues.
        </p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="bg-rust hover:bg-rust-dark text-cream font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-forest text-forest font-semibold px-6 py-3 rounded-lg hover:bg-forest hover:text-cream transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}