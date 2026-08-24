export default function AboutHost() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
      <div className="flex justify-center">
        {/*
          Placeholder circle standing in for the host's real photo.
          Swap in with: drop a photo into /public/images/host.jpg, then use
          <Image src="/images/host.jpg" alt="Your Safari Aunt" width={256} height={256}
                 className="rounded-full object-cover border-4 border-white shadow-md" />
        */}
        <div className="w-64 h-64 rounded-full bg-mustard-light border-4 border-white shadow-md" />
      </div>

      <div>
        <h2 className="font-serif text-3xl text-forest mb-4">
          I&rsquo;ll take you there&hellip; relax, I handle the details.
        </h2>
        <p className="text-forest/70 leading-relaxed">
          Welcome to a journey where you don&rsquo;t just visit a
          destination—you live it. I believe travel should be deeply
          personal, a collection of moments rather than just a checklist.
          From the moment you start dreaming to the day you return with a
          full heart, I am here to weave your perfect story.
        </p>
      </div>
    </section>
  );
}