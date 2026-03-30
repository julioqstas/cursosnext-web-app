export default function DashboardLoading() {
  return (
    <div className="min-h-dvh flex flex-col pt-10 px-6 lg:px-10 pb-24 max-w-7xl mx-auto w-full animate-[pulse_2s_ease-in-out_infinite]">
      {/* Welcome Header Skeleton */}
      <div className="flex flex-col md:flex-row gap-6 justify-between md:items-end mb-10 w-full">
        <div className="space-y-3">
          <div className="w-64 h-8 bg-slate-200 rounded-lg"></div>
          <div className="w-80 h-4 bg-slate-100 rounded-md"></div>
        </div>
        <div className="w-40 h-11 bg-slate-200 rounded-xl shrink-0"></div>
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-4xl p-6 ring-1 ring-slate-100 shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100"></div>
            <div>
              <div className="w-32 h-3 bg-slate-100 rounded-md mb-2"></div>
              <div className="w-16 h-8 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full">
        {/* Main Column */}
        <div className="lg:col-span-2 flex flex-col gap-10 w-full">
          <div className="w-40 h-6 bg-slate-200 rounded-md mb-2"></div>
          
          {/* Hero Card Skeleton */}
          <div className="w-full bg-white rounded-4xl p-3 shadow-sm ring-1 ring-slate-100 flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-64 aspect-video sm:aspect-auto sm:h-[180px] rounded-3xl bg-slate-100 shrink-0"></div>
            <div className="flex flex-col justify-center flex-1 py-3 pr-6 space-y-3">
              <div className="w-20 h-3 bg-slate-100 rounded-md mb-2"></div>
              <div className="w-full h-6 bg-slate-200 rounded-lg"></div>
              <div className="w-3/4 h-4 bg-slate-100 rounded-md mb-4"></div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full"></div>
            </div>
          </div>

          <div className="w-48 h-6 bg-slate-200 rounded-md mb-2 mt-4"></div>
          
          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             {[1, 2].map(i => (
               <div key={i} className="bg-white rounded-3xl p-3 shadow-sm ring-1 ring-slate-100 flex flex-col h-[320px]">
                 <div className="w-full aspect-video rounded-xl bg-slate-100 mb-4"></div>
                 <div className="px-3 pb-3 flex flex-col flex-1 space-y-3">
                    <div className="w-full h-5 bg-slate-200 rounded-lg"></div>
                    <div className="w-3/4 h-5 bg-slate-200 rounded-lg"></div>
                    <div className="mt-auto pt-4">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full flex flex-col gap-6">
          <div className="bg-white rounded-4xl p-6 shadow-sm ring-1 ring-slate-100 w-full h-[400px]">
             <div className="w-48 h-6 bg-slate-200 rounded-md mb-8"></div>
             <div className="flex gap-4 mb-6">
                <div className="w-[52px] h-[60px] rounded-2xl bg-slate-100 shrink-0"></div>
                <div className="flex flex-col justify-center space-y-2 flex-1">
                   <div className="w-full h-4 bg-slate-200 rounded-md"></div>
                   <div className="w-2/3 h-3 bg-slate-100 rounded-md"></div>
                </div>
             </div>
             <div className="flex gap-4 mb-6">
                <div className="w-[52px] h-[60px] rounded-2xl bg-slate-100 shrink-0"></div>
                <div className="flex flex-col justify-center space-y-2 flex-1">
                   <div className="w-full h-4 bg-slate-200 rounded-md"></div>
                   <div className="w-2/3 h-3 bg-slate-100 rounded-md"></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
