"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/tours", label: "Tours" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-forest/10">
      <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
  <Image
    src="/updatedimage.png"
    alt="Safari Aunt Expedition"
    width={100}
    height={50}
    className="rounded-lg"
    priority
  />
</Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                  active
                    ? "text-rust border-rust"
                    : "text-forest/80 border-transparent hover:text-rust"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/booking"
          className="hidden md:inline-block bg-rust hover:bg-rust-dark text-cream text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Book Your Story
        </Link>

        <button
          className="md:hidden text-forest"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden flex flex-col gap-4 px-6 pb-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-forest font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="bg-rust text-cream text-center font-semibold px-5 py-2.5 rounded-lg"
            onClick={() => setOpen(false)}
          >
            Book Your Story
          </Link>
        </nav>
      )}
    </header>
  );
}