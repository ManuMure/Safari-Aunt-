import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-cream-dark border-t border-forest/10 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <Image
  src="/updatedimage.png"
  alt="Safari Aunt Expedition"
  width={200}
  height={200}
  className="rounded-lg mb-3"
/>
          <p className="text-forest/70 text-sm max-w-xs">
            Curating bespoke adventures with the warmth of a scrapbook and
            the thrill of the wild.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-forest mb-3">Journey With Us</h4>
          <ul className="space-y-2 text-sm text-forest/70">
            <li>
              <Link href="/privacy" className="hover:text-rust">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-rust">Terms of Service</Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-rust">FAQ</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-forest mb-3">Our Ethos</h4>
          <ul className="space-y-2 text-sm text-forest/70 mb-4">
            <li>
              <Link href="/sustainability" className="hover:text-rust">Sustainability</Link>
            </li>
            <li>
              <Link href="/partner" className="hover:text-rust">Partner With Us</Link>
            </li>
          </ul>
          <div className="flex gap-3 text-rust">
            <a href="mailto:hello@safariauntexpedition.com" aria-label="Email">
              <Mail size={18} />
            </a>
            <a href="tel:+254700000000" aria-label="Phone">
              <Phone size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-forest/10 py-4 text-center text-xs text-forest/60">
        © {new Date().getFullYear()} Safari Aunt Expedition. All stories reserved.
      </div>
    </footer>
  );
}