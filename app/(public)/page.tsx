import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import FeaturedTours from "@/components/home/FeaturedTours";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import AboutHost from "@/components/home/AboutHost";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <FeaturedTours />
      <FeaturedDestinations />
      <AboutHost />
      <Testimonials />
      <Newsletter />
    </main>
  );
}