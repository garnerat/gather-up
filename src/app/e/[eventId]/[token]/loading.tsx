export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div>
          <div className="h-8 bg-gray-200 rounded-lg w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>

        {/* Summary card skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-5 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center space-y-1">
                <div className="h-8 w-8 bg-gray-200 rounded mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="text-center space-y-1">
                <div className="h-8 w-8 bg-gray-200 rounded mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header row */}
          <div className="bg-gray-50 p-3 flex gap-4 border-b border-gray-200">
            <div className="w-24 h-5 bg-gray-200 rounded"></div>
            <div className="flex-1 flex gap-4 justify-around">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          {/* Body rows */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 flex items-center gap-4 border-b border-gray-100">
              <div className="w-24 h-5 bg-gray-200 rounded"></div>
              <div className="flex-1 flex gap-4 justify-around">
                <div className="w-11 h-11 bg-gray-200 rounded-lg"></div>
                <div className="w-11 h-11 bg-gray-200 rounded-lg"></div>
                <div className="w-11 h-11 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Refresh button skeleton */}
        <div className="h-10 bg-gray-200 rounded-lg w-28"></div>
      </div>
    </main>
  );
}
