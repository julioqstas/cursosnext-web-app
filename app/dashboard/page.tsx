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

    const moduleIds = (moduleData ?? []).map((m: any) => m.id)
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
    <div className="min-h-dvh bg-surface text-on-surface font-sans antialiased">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-on-surface text-lg tracking-tight">ISIMOVA Academy</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-on-surface-variant font-medium text-sm hidden sm:block">
              {profile?.full_name}
            </span>
            <form action={logoutAction}>
              <button type="submit"
                className="text-on-surface-variant hover:text-primary font-bold text-sm transition-colors tracking-wide">
                SALIR
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">
            Bienvenido, {profile?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-on-surface-variant mt-2 text-lg font-light">Continúa tu aprendizaje donde lo dejaste.</p>
        </div>

        {(!enrollments || enrollments.length === 0) ? (
          <div className="text-center py-20 text-on-surface-variant">
            <svg className="w-16 h-16 mx-auto mb-6 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-xl font-light">No tienes cursos matriculados aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  className="group bg-surface-container-low rounded-3xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col transition-all duration-500 hover:bg-surface-container-high hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)]"
                >
                  {/* Thumbnail */}
                  <div className="relative h-56 bg-surface-container-highest overflow-hidden p-3 pb-0 rounded-t-3xl">
                    <div className="w-full h-full rounded-t-2xl overflow-hidden relative">
                      {course?.image_url ? (
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-container flex items-center justify-center">
                          <svg className="w-12 h-12 text-on-surface-variant/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Gradient overlay to smoothly blend with card body */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-surface-container-low to-transparent mix-blend-normal opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {isPaused && (
                        <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center">
                          <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                            Pausado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-8 pt-6 flex flex-col flex-1 relative z-10 bg-surface-container-low group-hover:bg-surface-container-high transition-colors duration-500">
                    <h2 className="text-on-surface font-bold text-xl leading-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {course?.title}
                    </h2>
                    {course?.description && (
                      <p className="text-on-surface-variant font-light text-sm line-clamp-2 mb-6 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Progreso</span>
                        <span className="text-primary font-bold text-sm">{progress}%</span>
                      </div>
                      <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-linear-to-r from-primary to-primary-variant h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(249,115,22,0.4)] relative"
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/30 blur-[2px] rounded-full"></div>
                        </div>
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
