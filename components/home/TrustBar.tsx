import { ShieldCheck, Heart, Camera } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, label: "Safe & Reliable" },
  { icon: Heart, label: "Passionate Host" },
  { icon: Camera, label: "Memories That Last a Lifetime" },
];

export default function TrustBar() {
  return (
    <section className="mx-auto max-w-5xl px-6 -mt-6 relative z-10">
      <div className="bg-white rounded-xl shadow-sm border border-forest/10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 py-6 px-8">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-sm font-semibold text-forest/80 uppercase tracking-wide"
          >
            <Icon size={18} className="text-rust" />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}