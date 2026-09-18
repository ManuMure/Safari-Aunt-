export default function DestinationsLoading() {
  return (
    <main className="animate-pulse">
      <div className="text-center pt-16 pb-4 px-6">
        <div className="h-10 bg-forest/10 rounded-lg w-64 mx-auto mb-3" />
        <div className="h-4 bg-forest/10 rounded w-96 max-w-full mx-auto" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        {[...Array(2)].map((_, section) => (
          <div key={section}>
            <div className="h-7 bg-forest/10 rounded w-40 mb-6" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-forest/10 rounded-xl overflow-hidden"
                >
                  <div className="h-48 bg-forest/10" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-forest/10 rounded w-2/3" />
                    <div className="h-3 bg-forest/10 rounded w-1/3" />
                    <div className="h-4 bg-forest/10 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}