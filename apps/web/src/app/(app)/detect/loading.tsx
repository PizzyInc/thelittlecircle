export default function DetectLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-20 bg-sky-100 rounded-lg mb-2" />
        <div className="h-4 w-60 bg-sky-50 rounded-lg" />
      </div>
      <div className="bg-white rounded-2xl border border-sky-200 p-6">
        <div className="h-40 bg-sky-50 rounded-xl mb-4" />
        <div className="h-11 bg-sky-100 rounded-xl" />
      </div>
    </div>
  );
}
