import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isLessonUnlocked } from '@/lib/drip'
import type { LessonWithModule } from '@/lib/drip'
import { markLessonCompleteAction } from '@/app/actions/progress'
import YouTubePlayer from '@/app/components/YouTubePlayer'
import LessonAccordion from '@/app/components/LessonAccordion'

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>
}

export default async function LessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single()

  if (!enrollment || enrollment.status === 'suspended') redirect('/dashboard')

  const admin = createAdminClient()

  // Get course + modules + lessons
  const { data: course } = await admin
    .from('courses')
    .select('id, title, instructor_name, instructor_bio, instructor_avatar_url')
    .eq('id', courseId)
    .single()

  if (!course) notFound()

  const { data: modules } = await admin
    .from('modules')
    .select('id, title, order_index')
    .eq('course_id', courseId)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  const moduleIds = (modules ?? []).map((m: any) => m.id)
  const { data: lessons } = await admin
    .from('lessons')
    .select('*')
    .in('module_id', moduleIds)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // Lesson overrides
  const { data: overrides } = await supabase
    .from('lesson_overrides')
    .select('*')
    .eq('enrollment_id', enrollment.id)

  // Progress
  const { data: progressData } = await supabase
    .from('progress')
    .select('lesson_id, is_completed')
    .eq('user_id', user.id)
    .eq('is_completed', true)

  const completedIds = new Set((progressData ?? []).map((p) => p.lesson_id))

  // Build LessonWithModule list
  const moduleOrderMap = Object.fromEntries((modules ?? []).map((m: any) => [m.id, m.order_index]))
  const allLessons: LessonWithModule[] = (lessons ?? []).map((l: any) => ({
    ...l,
    moduleOrderIndex: moduleOrderMap[l.module_id] ?? 0,
  }))

  // Current lesson
  const currentLesson = allLessons.find((l) => l.id === lessonId)
  if (!currentLesson) notFound()

  const isUnlocked = isLessonUnlocked(
    currentLesson, enrollment, overrides ?? [], allLessons, completedIds
  )

  if (!isUnlocked) redirect(`/cursos/${courseId}`)

  const isCompleted = completedIds.has(lessonId)

  // Group lessons by module for accordion
  const groupedModules = (modules ?? []).map((mod: any) => ({
    ...mod,
    lessons: allLessons
      .filter((l) => l.module_id === mod.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((l: any) => ({
        ...l,
        unlocked: isLessonUnlocked(l, enrollment, overrides ?? [], allLessons, completedIds),
        completed: completedIds.has(l.id),
        isCurrent: l.id === lessonId,
      })),
  }))

  const markComplete = markLessonCompleteAction.bind(null, lessonId, courseId)
  const progressPercent = allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-primary/20">
      {/* Top nav */}
      <header className="bg-white/90 backdrop-blur-xl h-20 border-b border-slate-200/60 flex items-center px-6 sm:px-10 gap-6 sticky top-0 z-50">
        <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
             <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
             </svg>
          </div>
          <span className="text-sm font-black uppercase tracking-widest hidden sm:inline">Volver</span>
        </Link>
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-[15px] font-black text-slate-900 truncate tracking-tight">{course.title}</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-2xl shrink-0">
          <span className="text-[11px] font-black tracking-widest uppercase text-slate-500">Progreso</span>
          <span className="text-primary font-black text-sm">{progressPercent}%</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-6 md:px-10 py-10 flex flex-col xl:flex-row gap-12 items-start">
        
        {/* Left: Video + Content (approx 65-70%) */}
        <div className="flex-1 min-w-0 w-full flex flex-col items-center xl:items-start">
          {/* Video Container */}
          <div className="w-full relative mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl md:rounded-[2.5rem] group">
            {currentLesson.youtube_id ? (
              <YouTubePlayer youtubeId={currentLesson.youtube_id} title={currentLesson.title} />
            ) : (
              <div className="aspect-video w-full rounded-3xl md:rounded-[2.5rem] flex flex-col gap-4 items-center justify-center text-slate-400 font-light bg-slate-900">
                 <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                 <span>Video no disponible</span>
              </div>
            )}
            {/* Ambient subtle glow ring */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl md:rounded-[2.5rem] ring-1 ring-inset ring-white/10"></div>
          </div>

          {/* Lesson Metadata & Content */}
          <div className="mb-16 xl:max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-black tracking-widest uppercase mb-6">
              <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full ring-1 ring-primary/20">Módulo {groupedModules.findIndex((m: any) => m.id === currentLesson.module_id) + 1}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm ring-1 ring-slate-100">Lección {currentLesson.order_index} de {allLessons.length}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-10 tracking-tight leading-[1.15]">{currentLesson.title}</h1>

            {/* Formatted HTML Text */}
            <div className="w-full text-slate-600 leading-relaxed text-lg prose prose-slate prose-headings:text-slate-900 prose-headings:font-black prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-black prose-p:mb-6 max-w-none **:break-normal!">
              {currentLesson.content_md ? (
                <div 
                  className="w-full whitespace-pre-wrap [&_p]:whitespace-normal"
                  dangerouslySetInnerHTML={{ __html: currentLesson.content_md.replace(/<p>(\s|&nbsp;|\u00A0)*<\/p>/g, '<p><br></p>').replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ') }} 
                />
              ) : (
                <div className="bg-white p-6 rounded-3xl ring-1 ring-slate-100 shadow-sm inline-block">
                  <p className="italic font-medium m-0 flex items-center gap-3 text-slate-500">
                     <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Sin material complementario de lectura para esta lección.
                  </p>
                </div>
              )}
            </div>
            
            {/* Instructor / Key Takeaways block */}
            {(course.instructor_name || course.instructor_bio) && (
              <div className="flex flex-col sm:flex-row items-center sm:items-start bg-white rounded-4xl p-8 mt-16 gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-linear-to-b from-primary to-primary-variant group-hover:w-full transition-all duration-700 opacity-[0.03] pointer-events-none"></div>
                {course.instructor_avatar_url ? (
                  <img src={course.instructor_avatar_url} alt={course.instructor_name || 'Docente'} className="w-24 h-24 rounded-full shrink-0 object-cover ring-4 ring-primary/10 shadow-xl" />
                ) : (
                  <div className="w-24 h-24 rounded-full shrink-0 bg-slate-50 text-slate-400 flex items-center justify-center font-black text-4xl ring-1 ring-slate-200 shadow-inner">
                    {(course.instructor_name || course.title).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-center sm:text-left pt-2">
                  <span className="text-[10px] font-black tracking-widest uppercase text-primary mb-2 block">Instructor del Curso</span>
                  <p className="text-slate-900 font-black text-2xl tracking-tight mb-2">{course.instructor_name}</p>
                  <p className="text-slate-500 text-[15px] font-medium leading-relaxed">{course.instructor_bio}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar Cards (approx 30-35%) */}
        <aside className="w-full xl:w-[420px] shrink-0 flex flex-col gap-8 xl:sticky xl:top-[120px]">
          
          {/* Lesson Completion Action Card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 flex items-center gap-6">
             <div className="flex-1">
                <h3 className="text-slate-900 font-black text-[15px] mb-1">Estado de Lección</h3>
                <p className="text-slate-500 text-xs font-medium">Confirma tu avance grupal</p>
             </div>
             
             <div className="shrink-0 w-1/2">
                {!isCompleted ? (
                  <form action={markComplete} className="w-full">
                    <button type="submit" 
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm h-12 rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Marcar Lista
                    </button>
                  </form>
                ) : (
                  <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-sm h-12 rounded-xl flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Completada
                  </div>
                )}
             </div>
          </div>

          {/* Syllabus Accordion Wrapper */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-slate-900 text-sm font-black tracking-widest uppercase">Temario</h3>
                <span className="text-slate-400 text-xs font-bold">{allLessons.length} lecciones</span>
             </div>
             {/* Note: LessonAccordion itself was made visually appealing with white cards */}
             <LessonAccordion courseId={courseId} modules={groupedModules} />
          </div>

        </aside>
      </main>
    </div>
  )
}
