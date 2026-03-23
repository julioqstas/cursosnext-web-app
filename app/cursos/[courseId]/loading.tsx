export default function CourseLoading() {
  return (
    <div className="min-h-screen bg-[#0E1117] flex flex-col animate-pulse">
      {/* Top Nav Skeleton */}
      <header className="bg-gray-900 border-b border-gray-800 h-16 flex items-center px-4 sm:px-8 gap-4 sticky top-0 z-20">
        <div className="w-20 h-5 bg-gray-800 rounded-md"></div>
        <div className="h-6 w-px bg-gray-800 mx-2"></div>
        <div className="w-48 h-5 bg-gray-800 rounded-md"></div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* Video Placeholder */}
          <div className="w-full aspect-video bg-gray-900 rounded-2xl border border-gray-800"></div>
          
          {/* Title Area */}
          <div className="space-y-4">
            <div className="w-32 h-4 bg-gray-800 rounded-md"></div>
            <div className="w-3/4 h-10 bg-gray-800 rounded-xl"></div>
            <div className="w-1/2 h-10 bg-gray-800 rounded-xl"></div>
          </div>

          {/* Instructor Block Placeholder */}
          <div className="w-full h-24 bg-gray-900 border border-gray-800 rounded-xl"></div>

          {/* Text Lines */}
          <div className="space-y-3 pt-6">
            <div className="w-full h-4 bg-gray-800 rounded-md"></div>
            <div className="w-full h-4 bg-gray-800 rounded-md"></div>
            <div className="w-5/6 h-4 bg-gray-800 rounded-md"></div>
            <div className="w-4/6 h-4 bg-gray-800 rounded-md"></div>
            <div className="w-full h-4 bg-gray-800 rounded-md"></div>
          </div>
        </div>

        {/* Right Side Sidebar */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
          {/* Progress Card Placeholder */}
          <div className="w-full h-32 bg-gray-900 rounded-2xl border border-gray-800"></div>
          
          {/* Syllabus Card Placeholder */}
          <div className="w-full h-96 bg-gray-900 rounded-2xl border border-gray-800"></div>

          {/* Big Button Placeholder */}
          <div className="w-full h-14 bg-gray-900 rounded-xl"></div>
        </div>
      </main>
    </div>
  )
}
