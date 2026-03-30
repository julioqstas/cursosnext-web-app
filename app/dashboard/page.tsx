import { redirect } from 'next/navigation'
import Link from 'next/link'
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Hola de nuevo, {firstName} 👋</h1>
          <p className="text-slate-500 text-[15px]">Un buen día para absorber nuevo conocimiento. ¡Sigue liderando!</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold h-11 px-6 rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-transform active:scale-95 shrink-0">
          Explorar Catálogo
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12 w-full">
        <StatCard title="Diplomados en Curso" value={enrollments?.length ?? 0} icon="📚" color="bg-blue-50 text-blue-600 ring-blue-100" />
        <StatCard title="Horas Invertidas" value="24.5h" icon="⏱️" color="bg-orange-50 text-primary ring-orange-100" />
        <StatCard title="Certificados Logrados" value="1" icon="🎓" color="bg-emerald-50 text-emerald-600 ring-emerald-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full">
        {/* ── Main Column (70%) ── */}
        <div className="lg:col-span-2 flex flex-col gap-10 w-full">
          
          {mainCourse && (
            <section className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900">Seguir Viendo</h2>
                <Link href="/dashboard/cursos" className="text-sm font-bold text-primary hover:text-orange-600 transition-colors">
                  Ir a mis cursos
                </Link>
              </div>
              
              {/* Continue Watching Card (Hero) */}
              <Link href={mainCourseTargetUrl} className="w-full bg-white rounded-4xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100/80 flex flex-col sm:flex-row gap-6 relative overflow-hidden group cursor-pointer transition-shadow hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                {/* Thumbnail */}
                <div className="w-full sm:w-64 aspect-video sm:aspect-auto sm:h-[180px] rounded-3xl bg-slate-100 overflow-hidden relative shrink-0">
                  {mainCourse?.image_url ? (
                    <img src={mainCourse.image_url} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" alt="Cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/95 text-primary rounded-full flex items-center justify-center shadow-xl scale-95 group-hover:scale-105 transition-transform backdrop-blur-md">
                       <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
                    </div>
                  </div>
                </div>
                
                {/* Info Block */}
                <div className="flex flex-col justify-center flex-1 py-3 pr-6">
                  <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase mb-3 line-clamp-1">{mainCourse.title}</span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 line-clamp-2">Continuar con tu aprendizaje</h3>
                  <p className="text-sm font-medium text-slate-500 mb-6">Continúa aprendiendo a tu propio ritmo</p>
                  
                  <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    <span>Progreso Global</span>
                    <span className="text-primary">{courseProgressMap[mainCourse.id] ?? 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner relative">
                    <div className="bg-linear-to-r from-primary to-primary-variant h-full rounded-full transition-all duration-1000 relative" style={{ width: `${courseProgressMap[mainCourse.id] ?? 0}%` }}>
                       <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Quick Courses Row */}
          <section className="w-full">
             <h2 className="text-xl font-black text-slate-900 mb-6">Todos mis cursos</h2>
             
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

        {/* ── Right Column (30%) ── */}
        <div className="w-full flex flex-col gap-6">
          <section className="bg-white rounded-4xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100/80 w-full">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 animate-pulse"></span>
              Clases en Vivo (Zoom)
            </h2>
            <div className="flex flex-col gap-5">
               {/* Event Row */}
               <div className="flex gap-4 group cursor-pointer">
                 <div className="w-[52px] h-[60px] rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-primary/20 flex flex-col items-center justify-center shrink-0 transition-colors">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mar</span>
                   <span className="text-xl font-black text-slate-900 leading-none">12</span>
                 </div>
                 <div className="flex flex-col justify-center">
                   <h4 className="text-[15px] font-bold text-slate-900 group-hover:text-primary transition-colors">Mentoría de Riesgos</h4>
                   <p className="text-[13px] font-medium text-slate-500">19:00 - 21:00 (GMT-5)</p>
                 </div>
               </div>
               
               {/* Event Row */}
               <div className="flex gap-4 group cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                 <div className="w-[52px] h-[60px] rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Jue</span>
                   <span className="text-xl font-black text-slate-500 leading-none">14</span>
                 </div>
                 <div className="flex flex-col justify-center">
                   <h4 className="text-[15px] font-bold text-slate-500">Networking en Vivo</h4>
                   <p className="text-[13px] font-medium text-slate-400">20:00 - 21:30 (GMT-5)</p>
                 </div>
               </div>
            </div>
            
            <button className="w-full mt-6 py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors">
              Ver calendario completo
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-4xl p-6 flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100/80 transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1">
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ring-4 ${color}`}>
         {icon}
       </div>
       <div>
         <p className="text-[13px] font-bold text-slate-500 mb-1">{title}</p>
         <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
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
        <h4 className="text-[15px] font-black text-slate-900 mb-4 line-clamp-2 leading-tight">{title}</h4>
        <div className="mt-auto">
          <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 mb-2 tracking-widest">
            <span>Progreso</span>
            <span className="text-slate-900">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
            <div className="bg-slate-900 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
