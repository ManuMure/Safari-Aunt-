export default function DestinationDetailLoading() {
  return (
    <main className="animate-pulse">
      <div className="h-72 bg-forest/10" />

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
        <div className="space-y-3 max-w-2xl">
          <div className="h-8 bg-forest/10 rounded w-1/2" />
          <div className="h-4 bg-forest/10 rounded w-full" />
          <div className="h-4 bg-forest/10 rounded w-3/4" />
        </div>

        <div>
          <div className="h-6 bg-forest/10 rounded w-48 mb-6" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-forest/10 rounded-xl overflow-hidden"
              >
                <div className="h-56 bg-forest/10" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-forest/10 rounded w-3/4" />
                  <div className="h-4 bg-forest/10 rounded w-1/2" />
                  <div className="h-10 bg-forest/10 rounded-lg mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}