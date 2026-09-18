export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-forest/10 rounded-xl p-5 space-y-3"
          >
            <div className="h-4 bg-forest/10 rounded w-1/2" />
            <div className="h-7 bg-forest/10 rounded w-2/3" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-forest/10 rounded-xl p-6">
        <div className="h-6 bg-forest/10 rounded w-40 mb-6" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-forest/10 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}