export default function AdminLoading() {
  return (
    <div className="animate-pulse flex flex-col gap-8">
      {/* Header skeleton */}
      <div className="bg-white rounded-3xl p-8 border border-cue-border shadow-sm flex items-center justify-between">
        <div className="flex flex-col gap-3 max-w-xl">
          <div className="w-24 h-6 bg-gray-200 rounded-full" />
          <div className="w-72 h-8 bg-gray-200 rounded-lg" />
          <div className="w-96 h-5 bg-gray-100 rounded-lg" />
        </div>
        <div className="flex flex-col items-center gap-2 max-sm:hidden">
          <div className="w-16 h-14 bg-gray-200 rounded-lg" />
          <div className="w-24 h-4 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Assign form skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-cue-border shadow-sm">
        <div className="w-48 h-5 bg-gray-200 rounded mb-3" />
        <div className="w-full h-16 bg-gray-100 rounded-2xl" />
      </div>

      {/* Stats skeleton */}
      <div className="flex gap-4 justify-center flex-wrap">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 px-6 py-5 rounded-2xl bg-white border border-cue-border shadow-sm min-w-[120px]"
          >
            <div className="w-10 h-7 bg-gray-200 rounded" />
            <div className="w-16 h-3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-cue-border shadow-sm overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-cue-border">
          <div className="w-40 h-4 bg-gray-200 rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-6 px-6 py-4 border-b border-cue-border last:border-0"
          >
            <div className="flex-1">
              <div className="w-32 h-4 bg-gray-200 rounded mb-1" />
              <div className="w-48 h-3 bg-gray-100 rounded" />
            </div>
            <div className="w-20 h-4 bg-gray-100 rounded" />
            <div className="w-16 h-6 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
