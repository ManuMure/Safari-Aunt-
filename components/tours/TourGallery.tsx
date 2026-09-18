"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

export default function TourGallery({
  images,
  alt,
  overlay,
}: {
  images: string[];
  alt: string;
  overlay?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasImages = images.length > 0;

  function prev() {
    setActive((i) => (i - 1 + images.length) % images.length);
  }
  function next() {
    setActive((i) => (i + 1) % images.length);
  }

  return (
    <>
      <div className="relative h-80 md:h-96 bg-mustard-light">
        {hasImages && (
          <Image
            src={images[active]}
            alt={`${alt} photo ${active + 1}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest/60 via-forest/10 to-transparent" />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-forest/40 hover:bg-forest/60 text-cream rounded-full p-2 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-forest/40 hover:bg-forest/60 text-cream rounded-full p-2 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {hasImages && (
          <button
            onClick={() => setLightboxOpen(true)}
            aria-label="View full-size photo"
            className="absolute top-4 right-4 bg-forest/40 hover:bg-forest/60 text-cream rounded-full p-2 transition-colors"
          >
            <Expand size={18} />
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-6 py-8 max-w-5xl mx-auto">
          {overlay}
        </div>
      </div>

      {images.length > 1 && (
        <div className="bg-forest/5 border-b border-forest/10">
          <div className="mx-auto max-w-5xl px-6 py-3 flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => setActive(i)}
                className={`relative shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                  i === active
                    ? "border-rust"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`${alt} thumbnail ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {lightboxOpen && hasImages && (
        <div
          className="fixed inset-0 z-[100] bg-forest-dark/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-5 right-5 text-cream hover:text-mustard"
            aria-label="Close"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={28} />
          </button>
          {images.length > 1 && (
            <button
              className="absolute left-4 md:left-8 text-cream hover:text-mustard"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
            >
              <ChevronLeft size={36} />
            </button>
          )}
          <div
            className="relative w-full max-w-4xl h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active]}
              alt={`${alt} full size photo`}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          {images.length > 1 && (
            <button
              className="absolute right-4 md:right-8 text-cream hover:text-mustard"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
            >
              <ChevronRight size={36} />
            </button>
          )}
        </div>
      )}
    </>
  );
}