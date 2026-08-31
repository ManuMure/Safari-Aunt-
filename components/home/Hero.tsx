import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Image
        src="/back2.jpg"
        alt="Savanna at sunset"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-cream/70 via-cream/60 to-cream" />

      <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
        <h1 className="font-serif text-5xl md:text-6xl text-forest mb-4">
          Your Adventure, My Priority
        </h1>
        <p className="italic text-forest/70 text-lg max-w-xl mx-auto mb-10">
          &ldquo;I don&rsquo;t just show you a place, I create stories
          you&rsquo;ll cherish forever.&rdquo;
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/booking"
            className="bg-rust hover:bg-rust-dark text-cream font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Plan My Adventure
          </Link>
          <Link
            href="/tours"
            className="border border-forest text-forest font-semibold px-6 py-3 rounded-lg hover:bg-forest hover:text-cream transition-colors"
          >
            View Tours
          </Link>
        </div>
      </div>
    </section>
  );
}