export default function SettingsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-28 bg-sky-100 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-sky-50 rounded-lg" />
      </div>

      <div className="space-y-4">
        {/* Account section */}
        <div className="bg-white rounded-2xl border border-sky-200 p-6">
          <div className="h-4 w-20 bg-sky-100 rounded mb-1" />
          <div className="h-3 w-48 bg-sky-50 rounded mb-5" />
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-t border-sky-100">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 bg-sky-100 rounded" />
                  <div className="h-3 w-48 bg-sky-50 rounded" />
                </div>
                <div className="h-8 w-20 bg-sky-100 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Devices section */}
        <div className="bg-white rounded-2xl border border-sky-200 p-6">
          <div className="h-4 w-16 bg-sky-100 rounded mb-1" />
          <div className="h-3 w-56 bg-sky-50 rounded mb-5" />
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-sky-100">
                <div className="w-9 h-9 rounded-xl bg-sky-50 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 bg-sky-100 rounded" />
                  <div className="h-3 w-20 bg-sky-50 rounded" />
                </div>
                <div className="w-11 h-6 rounded-full bg-sky-100 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Circle section */}
        <div className="bg-white rounded-2xl border border-sky-200 p-6">
          <div className="h-4 w-32 bg-sky-100 rounded mb-1" />
          <div className="h-3 w-52 bg-sky-50 rounded mb-5" />
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className={i > 0 ? "pt-6 border-t border-sky-100 flex items-center justify-between" : ""}>
                {i === 0 ? (
                  <div>
                    <div className="h-3.5 w-24 bg-sky-100 rounded mb-3" />
                    <div className="flex gap-3">
                      <div className="flex-1 h-9 bg-sky-50 rounded-xl" />
                      <div className="w-16 h-9 bg-sky-100 rounded-xl" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-32 bg-sky-100 rounded" />
                      <div className="h-3 w-56 bg-sky-50 rounded" />
                    </div>
                    <div className="w-11 h-6 rounded-full bg-sky-100 flex-shrink-0" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stub sections */}
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-sky-200 p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4 w-28 bg-sky-100 rounded" />
              <div className="h-3 w-40 bg-sky-50 rounded" />
            </div>
            <div className="h-3 w-20 bg-sky-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
