import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Clock, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function StudentDashboard() {
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
      const modOrderMap = Object.fromEntries((moduleData ?? []).map((m: any) => [m.id, m.order_index]))
      
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
        const mod = moduleData?.find((m: any) => m.id === l.module_id)
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

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Alumno'
  const mainCourseEnrollment = enrollments && enrollments.length > 0 ? enrollments[0] : null
  const mainCourse = mainCourseEnrollment?.courses as any
  const mainCourseTargetUrl = mainCourse && nextLessonMap[mainCourse.id] 
      ? `/cursos/${mainCourse.id}/leccion/${nextLessonMap[mainCourse.id]}` 
      : `/cursos/${mainCourse?.id}`

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 pb-24 w-full">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col md:flex-row gap-6 justify-between md:items-end mb-10 w-full">
        <div>
          <h1 className="text-3xl font-black text-isimova-blue tracking-tight mb-2">Hola de nuevo, <span className="text-primary drop-shadow-[0_2px_10px_rgba(242,140,56,0.3)]">{firstName}</span> 👋</h1>
          <p className="text-slate-500 text-[15px]">Un buen día para absorber nuevo conocimiento. ¡Sigue liderando!</p>
        </div>
      </div>

      {/* ── Stats Row (Mobile Carousel / Desktop Grid) ── */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-12 w-[calc(100%+3rem)] lg:w-full">
        <StatCard title="Diplomados en Curso" value={enrollments?.length ?? 0} icon={<BookOpen strokeWidth={2.5} className="w-[22px] h-[22px]" />} color="bg-primary/10 text-primary ring-primary/20" />
        <StatCard title="Horas Invertidas" value="0h" icon={<Clock strokeWidth={2.5} className="w-[22px] h-[22px]" />} color="bg-primary/10 text-primary ring-primary/20" />
        <StatCard title="Certificados Logrados" value="0" icon={<Award strokeWidth={2.5} className="w-[22px] h-[22px]" />} color="bg-primary/10 text-primary ring-primary/20" />
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-10">
        {/* ── Main Column ── */}
        <div className="flex-1 flex flex-col gap-10 w-full max-w-5xl">
          
          {/* mainCourse && ( Continue Watching Block Hidden ) */}

          {/* Quick Courses Row */}
          <section className="w-full">
             <h2 className="text-xl font-black text-isimova-blue mb-6">Todos mis cursos</h2>
             
             {(!enrollments || enrollments.length === 0) ? (
               <div className="text-center py-10 text-slate-400">
                 No tienes cursos activos actualmente.
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {enrollments.map((enrollment) => {
                   const course = enrollment.courses as any
                   const progress = courseProgressMap[course?.id] ?? 0
                   const nextLessonId = nextLessonMap[course?.id]
                   const targetUrl = nextLessonId ? `/cursos/${course?.id}/leccion/${nextLessonId}` : `/cursos/${course?.id}`
                   
                   return (
                     <Link key={enrollment.id} href={targetUrl}>
                       <CourseCard title={course.title} progress={progress} image={course.image_url} />
                     </Link>
                   )
                 })}
               </div>
             )}
          </section>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="min-w-[150px] aspect-[4/3] lg:aspect-auto lg:min-h-[140px] bg-white rounded-3xl lg:rounded-4xl p-5 lg:p-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100/80 transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 snap-center shrink-0">
       <div className={`w-11 h-11 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center ring-4 shrink-0 mb-auto ${color}`}>
         {icon}
       </div>
       <div className="mt-4 lg:mt-6">
         <p className="text-[12px] lg:text-[13px] font-bold text-slate-500 mb-0.5 lg:mb-1 leading-tight">{title}</p>
         <p className="text-2xl lg:text-3xl font-black text-isimova-blue tracking-tight">{value}</p>
       </div>
    </div>
  )
}

// React issue: Cannot use <img> with undefined src without hydration mismatch, so fallback implemented.
function CourseCard({ title, progress, image }: any) {
  return (
    <div className="bg-white rounded-3xl p-3 flex flex-col shadow-[0_4px_20px_rgb(0,0,0,0.03)] ring-1 ring-slate-100/80 group cursor-pointer hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] transition-shadow w-full h-full">
      <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 relative bg-slate-100 flex items-center justify-center">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt={title} />
        ) : (
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        )}
      </div>
      <div className="px-3 pb-3 flex flex-col flex-1">
        <h4 className="text-[15px] font-black text-isimova-blue mb-4 line-clamp-2 leading-tight">{title}</h4>
        <div className="mt-auto">
          <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 mb-2 tracking-widest">
            <span>Progreso</span>
            <span className="text-isimova-blue">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
            <div className="bg-isimova-blue h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
