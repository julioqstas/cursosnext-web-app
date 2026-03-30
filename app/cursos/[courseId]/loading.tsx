export default function CourseLoading() {
  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col animate-[pulse_2s_ease-in-out_infinite]">
      {/* Top Nav Skeleton */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 h-20 flex items-center px-6 sm:px-10 gap-6 sticky top-0 z-20">
        <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
        <div className="w-20 h-4 bg-slate-200 rounded-md"></div>
        <div className="h-8 w-px bg-slate-200 hidden sm:block mx-2"></div>
        <div className="w-48 h-5 bg-slate-200 rounded-md flex-1"></div>
        <div className="w-32 h-8 bg-slate-100 rounded-2xl hidden sm:block"></div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-6 md:px-10 py-10 flex flex-col xl:flex-row gap-12 items-start">
        
        {/* Left Side */}
        <div className="flex-1 min-w-0 w-full mb-16 xl:max-w-4xl">
          {/* Video Placeholder */}
          <div className="w-full min-h-[50vh] xl:min-h-0 xl:aspect-video bg-slate-100 rounded-[2.5rem] mb-12 relative overflow-hidden ring-1 ring-slate-200">
             <div className="absolute inset-0 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 animate-[shimmer_2s_infinite]"></div>
          </div>
          
          {/* Title Area */}
          <div className="flex gap-3 mb-6">
            <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
            <div className="w-24 h-6 bg-slate-100 rounded-full"></div>
          </div>
          
          <div className="space-y-4 mb-10">
            <div className="w-full h-12 bg-slate-200 rounded-2xl max-w-2xl"></div>
            <div className="w-3/4 h-12 bg-slate-200 rounded-2xl"></div>
          </div>

          {/* Text Lines */}
          <div className="space-y-4">
            <div className="w-full h-5 bg-slate-100 rounded-lg"></div>
            <div className="w-full h-5 bg-slate-100 rounded-lg"></div>
            <div className="w-5/6 h-5 bg-slate-100 rounded-lg"></div>
            <div className="w-4/6 h-5 bg-slate-100 rounded-lg"></div>
          </div>

          {/* Instructor Block Placeholder */}
          <div className="w-full h-32 bg-white rounded-4xl p-8 mt-16 shadow-sm ring-1 ring-slate-100 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-100 shrink-0"></div>
            <div className="space-y-4 flex-1">
              <div className="w-24 h-3 bg-slate-200 rounded-md"></div>
              <div className="w-48 h-6 bg-slate-200 rounded-md"></div>
              <div className="w-3/4 h-4 bg-slate-100 rounded-md"></div>
            </div>
          </div>
        </div>

        {/* Right Side Sidebar */}
        <div className="w-full xl:w-[420px] shrink-0 flex flex-col gap-8 xl:sticky xl:top-[120px]">
          {/* Action Card Placeholder */}
          <div className="w-full bg-white rounded-4xl p-6 shadow-sm ring-1 ring-slate-100 flex items-center gap-6">
             <div className="flex-1 space-y-3">
               <div className="w-32 h-4 bg-slate-200 rounded-md"></div>
               <div className="w-24 h-3 bg-slate-100 rounded-md"></div>
             </div>
             <div className="shrink-0 w-1/2 h-12 bg-slate-200 rounded-xl"></div>
          </div>
          
          {/* Syllabus Card Placeholder */}
          <div className="w-full flex justify-between px-2 mb-2">
             <div className="w-20 h-4 bg-slate-200 rounded-md"></div>
             <div className="w-24 h-3 bg-slate-100 rounded-md"></div>
          </div>
          
          <div className="space-y-3">
             {[1, 2, 3].map(i => (
                <div key={i} className="w-full h-16 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between px-5">
                   <div className="space-y-2">
                      <div className="w-40 h-4 bg-slate-200 rounded-md"></div>
                      <div className="w-24 h-3 bg-slate-100 rounded-md"></div>
                   </div>
                   <div className="w-8 h-8 rounded-xl bg-slate-100"></div>
                </div>
             ))}
          </div>
        </div>
      </main>
    </div>
  )
}
