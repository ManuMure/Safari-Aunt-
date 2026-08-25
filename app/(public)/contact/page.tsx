import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";

export default function ContactPage() {
  // Placeholder contact details — swap these for the real ones before launch.
  const PHONE = "+254 700 000 000";
  const WHATSAPP_NUMBER = "254700000000"; // digits only, no + or spaces, for the wa.me link
  const EMAIL = "hello@safariauntexpedition.com";
  const ADDRESS = "Westlands, Nairobi, Kenya";

  const whatsappMessage = encodeURIComponent(
    "Hello, I'd like to know more about your safari tours."
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-forest mb-3">
          Get In Touch
        </h1>
        <p className="text-forest/70 max-w-xl mx-auto">
          Questions about a tour, a custom itinerary, or just want to say
          hello? We&rsquo;d love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-10">
        <div className="space-y-6">
          <InfoItem icon={Phone} label="Phone" value={PHONE} href={`tel:${WHATSAPP_NUMBER}`} />
          <InfoItem
            icon={MessageCircle}
            label="WhatsApp"
            value="Chat with us"
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
            external
          />
          <InfoItem icon={Mail} label="Email" value={EMAIL} href={`mailto:${EMAIL}`} />
          <InfoItem
            icon={MapPin}
            label="Office"
            value={ADDRESS}
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`}
            external
          />
          <div className="flex items-start gap-3">
            <Clock size={18} className="text-rust mt-1 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-forest">Business Hours</p>
              <p className="text-sm text-forest/70">Mon – Fri: 8am – 6pm</p>
              <p className="text-sm text-forest/70">Sat: 9am – 2pm</p>
              <p className="text-sm text-forest/70">Sun: Closed</p>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </main>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-start gap-3 group"
    >
      <Icon size={18} className="text-rust mt-1 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-forest">{label}</p>
        <p className="text-sm text-forest/70 group-hover:text-rust transition-colors">
          {value}
        </p>
      </div>
    </a>
  );
}