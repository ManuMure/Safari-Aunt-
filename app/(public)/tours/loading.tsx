export default function TourDetailLoading() {
  return (
    <main className="animate-pulse">
      <div className="h-[420px] bg-forest/10" />

      <div className="mx-auto max-w-6xl px-6 py-12 grid md:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-6">
          <div className="flex gap-2">
            <div className="h-8 bg-forest/10 rounded-full w-24" />
            <div className="h-8 bg-forest/10 rounded-full w-24" />
            <div className="h-8 bg-forest/10 rounded-full w-24" />
            <div className="h-8 bg-forest/10 rounded-full w-24" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-forest/10 rounded w-full" />
            <div className="h-4 bg-forest/10 rounded w-full" />
            <div className="h-4 bg-forest/10 rounded w-3/4" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-forest/10 rounded w-5/6" />
            <div className="h-4 bg-forest/10 rounded w-2/3" />
          </div>
        </div>

        <div className="bg-white border border-forest/10 rounded-xl p-6 h-fit space-y-4">
          <div className="h-6 bg-forest/10 rounded w-1/2" />
          <div className="h-10 bg-forest/10 rounded-lg" />
          <div className="h-10 bg-forest/10 rounded-lg" />
          <div className="h-12 bg-forest/10 rounded-lg mt-2" />
        </div>
      </div>
    </main>
  );
}