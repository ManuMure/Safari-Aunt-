import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 text-center">
      <Image
        src="/logo.png"
        alt="Safari Aunt Expedition"
        width={72}
        height={72}
        className="rounded-lg mb-6"
      />
      <h1 className="font-serif text-4xl text-forest mb-3">
        This Trail Doesn&rsquo;t Exist
      </h1>
      <p className="text-forest/70 max-w-md mb-8">
        The page you&rsquo;re looking for may have moved or never existed.
        Let&rsquo;s get you back on track.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="bg-rust hover:bg-rust-dark text-cream font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/tours"
          className="border border-forest text-forest font-semibold px-6 py-3 rounded-lg hover:bg-forest hover:text-cream transition-colors"
        >
          Browse Tours
        </Link>
      </div>
    </main>
  );
}