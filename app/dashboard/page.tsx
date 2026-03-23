import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/actions/auth'
import { getCourseProgress } from '@/lib/drip'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get active/paused enrollments with course data
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id, status, drip_interval_days,
      courses ( id, title, description, image_url )
    `)
    .eq('user_id', user.id)
    .neq('status', 'suspended')

  // Get all lessons for enrolled courses to compute progress
  const courseIds = enrollments?.map((e) => (e.courses as any)?.id).filter(Boolean) ?? []

  const { data: allProgress } = await supabase
    .from('progress')
    .select('lesson_id, is_completed')
    .eq('user_id', user.id)
    .eq('is_completed', true)

  const completedIds = new Set((allProgress ?? []).map((p) => p.lesson_id))

  // For each enrollment, get lesson count and next lesson
  const courseProgressMap: Record<string, number> = {}
  const nextLessonMap: Record<string, string> = {}

  if (courseIds.length > 0) {
    const { data: moduleData } = await supabase
      .from('modules')
      .select('id, course_id, order_index')
      .in('course_id', courseIds)
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    const moduleIds = (moduleData ?? []).map((m) => m.id)
    if (moduleIds.length > 0) {
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('id, module_id, order_index')
        .in('module_id', moduleIds)
        .eq('is_active', true)

      // Map module's order index
      const modOrderMap = Object.fromEntries((moduleData ?? []).map(m => [m.id, m.order_index]))
      
      // Sort all lessons
      const sortedLessons = (lessonData ?? []).sort((a, b) => {
        if (modOrderMap[a.module_id] !== modOrderMap[b.module_id]) {
          return modOrderMap[a.module_id] - modOrderMap[b.module_id]
        }
        return a.order_index - b.order_index
      })

      const lessonsByCourse: Record<string, string[]> = {}
      for (const l of sortedLessons) {
        // Find course_id for this lesson's module
        const mod = moduleData?.find(m => m.id === l.module_id)
        if (mod) {
          if (!lessonsByCourse[mod.course_id]) lessonsByCourse[mod.course_id] = []
          lessonsByCourse[mod.course_id].push(l.id)
        }
      }

      for (const [courseId, lessonIds] of Object.entries(lessonsByCourse)) {
        const total = lessonIds.length
        const done = lessonIds.filter((id) => completedIds.has(id)).length
        courseProgressMap[courseId] = total === 0 ? 0 : Math.round((done / total) * 100)
        
        // Find first uncompleted lesson, or fallback to first lesson
        const nextUncompleted = lessonIds.find(id => !completedIds.has(id))
        nextLessonMap[courseId] = nextUncompleted ?? lessonIds[0]
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-semibold text-white">ISIMOVA Academy</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">
              {profile?.full_name}
            </span>
            <form action={logoutAction}>
              <button type="submit"
                className="text-gray-400 hover:text-white text-sm transition-colors">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Bienvenido, {profile?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1">Continúa donde lo dejaste.</p>
        </div>

        {(!enrollments || enrollments.length === 0) ? (
          <div className="text-center py-20 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-lg">No tienes cursos matriculados aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const course = enrollment.courses as any
              const progress = courseProgressMap[course?.id] ?? 0
              const isPaused = enrollment.status === 'paused'
              const nextLessonId = nextLessonMap[course?.id]
              const targetUrl = nextLessonId 
                ? `/cursos/${course?.id}/leccion/${nextLessonId}` 
                : `/cursos/${course?.id}`

              return (
                <Link
                  key={enrollment.id}
                  href={targetUrl}
                  className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden
                             hover:border-indigo-500 transition-all duration-300 hover:shadow-lg
                             hover:shadow-indigo-500/10 flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 bg-gray-800 overflow-hidden">
                    {course?.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {isPaused && (
                      <div className="absolute inset-0 bg-gray-950/70 flex items-center justify-center">
                        <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded-full px-3 py-1 text-xs font-medium">
                          Pausado
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="text-white font-semibold text-base leading-snug mb-1 line-clamp-2">
                      {course?.title}
                    </h2>
                    {course?.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                        {course.description}
                      </p>
                    )}
                    <div className="mt-auto">
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>Progreso</span>
                        <span className="text-indigo-400 font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
