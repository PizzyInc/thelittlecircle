export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-36 bg-sky-100 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-sky-50 rounded-lg" />
      </div>

      {/* CircleToggleCard skeleton */}
      <div className="bg-white rounded-2xl border border-sky-200 mb-8 overflow-hidden">
        <div className="flex items-center gap-5 p-5">
          <div className="w-12 h-12 rounded-full bg-sky-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-sky-100 rounded" />
            <div className="h-3 w-48 bg-sky-50 rounded" />
          </div>
          <div className="w-11 h-6 rounded-full bg-sky-100 flex-shrink-0" />
        </div>
        <div className="h-px bg-sky-100 mx-5" />
        <div className="flex items-center gap-5 p-5">
          <div className="w-12 h-12 rounded-full bg-sky-50 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-sky-100 rounded" />
            <div className="h-3 w-44 bg-sky-50 rounded" />
          </div>
          <div className="w-11 h-6 rounded-full bg-sky-100 flex-shrink-0" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-sky-200 p-6">
            <div className="h-3 w-24 bg-sky-100 rounded mb-3" />
            <div className="h-8 w-12 bg-sky-100 rounded mb-2" />
            <div className="h-3 w-16 bg-sky-50 rounded" />
          </div>
        ))}
      </div>

      {/* Recent detections */}
      <div className="bg-white rounded-2xl border border-sky-200 p-6">
        <div className="h-4 w-36 bg-sky-100 rounded mb-4" />
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-sky-100">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex-shrink-0" />
              <div className="flex-1 h-3 bg-sky-50 rounded" />
              <div className="w-16 h-6 rounded-full bg-sky-100 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
