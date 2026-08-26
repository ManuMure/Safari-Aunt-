import { Quote } from "lucide-react";

/**
 * Placeholder testimonials — swap these for real traveler reviews once
 * there's an actual reviews system (Phase 2) or once you have real
 * feedback to quote. Keep these clearly fictional until then.
 */
const TESTIMONIALS = [
  {
    quote:
      "Every detail was handled with so much care. It genuinely felt like traveling with family who happened to know Kenya inside out.",
    name: "Amara O.",
    trip: "7-Day Serengeti Spirit",
  },
  {
    quote:
      "The pace was perfect — never rushed, always exactly where we needed to be for the best light and the best views.",
    name: "David & Priya K.",
    trip: "Highland Cloud Retreat",
  },
  {
    quote:
      "Our kids still talk about the mokoro canoe rides. A trip our whole family will remember for years.",
    name: "The Mwangi Family",
    trip: "Delta Waterways Discovery",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-cream-dark py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-serif text-3xl text-forest text-center mb-10">
          Stories From the Road
        </h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-xl border border-forest/10 p-6">
              <Quote size={24} className="text-mustard mb-3" />
              <p className="text-sm text-forest/80 mb-4 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="text-sm font-semibold text-forest">{t.name}</p>
              <p className="text-xs text-forest/50">{t.trip}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}