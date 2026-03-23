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

  return (
    <div className="min-h-dvh bg-surface flex flex-col font-sans antialiased text-on-surface">
      {/* Top nav */}
      <header className="bg-surface/80 backdrop-blur-md h-20 flex items-center px-4 sm:px-8 gap-4 sticky top-0 z-50">
        <Link href="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-bold tracking-wide hidden sm:inline">VOLVER</span>
        </Link>
        <div className="h-6 w-px bg-white/10 mx-2"></div>
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-white font-bold tracking-wide">{course.title}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Left: Video + Content (approx 65-70%) */}
        <div className="flex-1 min-w-0 w-full">
          {/* Video Container */}
          <div className="rounded-3xl overflow-hidden bg-surface-container-lowest shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] mb-10 relative">
            {currentLesson.youtube_id ? (
              <YouTubePlayer youtubeId={currentLesson.youtube_id} title={currentLesson.title} />
            ) : (
              <div className="aspect-video flex items-center justify-center text-on-surface-variant font-light bg-surface-container-low">Video no disponible</div>
            )}
            
            {/* Ambient glow around video frame purely for esthetics layer */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-inset ring-white/5"></div>
          </div>

          {/* Lesson Metadata & Content */}
          <div className="mb-12 lg:pr-8">
            <div className="flex items-center gap-3 text-xs font-bold text-primary tracking-widest mb-4 uppercase">
              <span>MÓDULO {groupedModules.findIndex((m: any) => m.id === currentLesson.module_id) + 1}</span>
              <span className="text-white/20">•</span>
              <span className="text-on-surface-variant font-medium tracking-normal text-sm">Lección {currentLesson.order_index} de {allLessons.length}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-8 tracking-tight leading-tight">{currentLesson.title}</h1>

            {/* Markdown text */}
            <div className="text-on-surface-variant leading-relaxed text-lg prose prose-invert prose-p:text-on-surface-variant prose-headings:text-on-surface prose-a:text-primary max-w-none">
              {currentLesson.content_md ? (
                <div className="whitespace-pre-wrap">{currentLesson.content_md}</div>
              ) : (
                <p className="italic text-on-surface-variant/50 font-light">Sin material complementario de lectura para esta lección.</p>
              )}
            </div>
            
            {/* Instructor / Key Takeaways block */}
            {(course.instructor_name || course.instructor_bio) && (
              <div className="flex bg-surface-container-low rounded-3xl p-6 mt-12 items-center gap-5 shadow-2xl shadow-black/20 ring-1 ring-white/5">
                {course.instructor_avatar_url ? (
                  <img src={course.instructor_avatar_url} alt={course.instructor_name || 'Docente'} className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20 bg-surface" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl shadow-[inset_0_0_15px_rgba(249,115,22,0.2)]">
                    {(course.instructor_name || course.title).charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-on-surface font-extrabold text-base tracking-wide">{course.instructor_name || 'Instructor del Curso'}</p>
                  <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1 mb-1">{course.instructor_bio || 'ISIMOVA Academy'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar Cards (approx 30-35%) */}
        <aside className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6 sticky top-28">
          
          {/* Progress Card */}
          <div className="bg-surface-container-low rounded-3xl p-8 shadow-2xl shadow-black/40">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-on-surface text-sm font-bold tracking-widest uppercase">Tu Progreso</h3>
              <span className="text-primary font-bold text-xl">{allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0}%</span>
            </div>
            
            <div className="flex justify-between text-xs text-on-surface-variant font-medium mb-3">
              <span>{completedIds.size} completadas</span>
              <span>{allLessons.length - completedIds.size} restantes</span>
            </div>
            
            <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-linear-to-r from-primary to-primary-variant h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(249,115,22,0.6)] relative" 
                style={{ width: `${allLessons.length > 0 ? (completedIds.size / allLessons.length) * 100 : 0}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/40 blur-[2px] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Syllabus Card */}
          <div className="bg-surface-container-low rounded-3xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden lg:max-h-[60vh]">
            <div className="p-6 pb-4 flex justify-between items-center bg-surface-container-low z-10">
              <h3 className="text-on-surface text-sm font-bold tracking-widest uppercase">Contenido del Curso</h3>
              <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7-7-7-7" />
              </svg>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2">
              <LessonAccordion courseId={courseId} modules={groupedModules} />
            </div>
          </div>

          {/* Complete Button */}
          {!isCompleted && (
            <form action={markComplete} className="mt-2">
              <button type="submit" 
                className="w-full bg-linear-to-r from-primary to-primary-variant hover:to-primary-fixed-variant text-white font-bold text-sm py-5 px-6 rounded-2xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] transition-all hover:-translate-y-1 active:scale-[0.98] uppercase tracking-widest flex items-center justify-between">
                <span>Completar Lección</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </button>
            </form>
          )}
          
          {isCompleted && (
            <div className="w-full bg-emerald-500/10 text-emerald-400 font-bold text-sm py-5 px-6 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest shadow-[inset_0_0_20px_rgba(16,185,129,0.1)] mt-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="mt-0.5">Lección Completada</span>
            </div>
          )}

        </aside>
      </main>
    </div>
  )
}
