export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-950 animate-pulse">
      <header className="bg-gray-900 border-b border-gray-800 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-800"></div>
          <div className="w-32 h-5 bg-gray-800 rounded-md"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 h-4 bg-gray-800 rounded-md hidden sm:block"></div>
          <div className="w-10 h-4 bg-gray-800 rounded-md"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 space-y-3">
          <div className="w-64 h-8 bg-gray-800 rounded-lg"></div>
          <div className="w-48 h-4 bg-gray-800 rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col h-80">
              <div className="h-44 bg-gray-800"></div>
              <div className="p-5 flex flex-col flex-1 space-y-3">
                <div className="w-3/4 h-5 bg-gray-800 rounded-md"></div>
                <div className="w-full h-3 bg-gray-800 rounded-md"></div>
                <div className="w-5/6 h-3 bg-gray-800 rounded-md"></div>
                <div className="mt-auto pt-4">
                  <div className="flex justify-between mb-2">
                    <div className="w-16 h-3 bg-gray-800 rounded-md"></div>
                    <div className="w-8 h-3 bg-gray-800 rounded-md"></div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
