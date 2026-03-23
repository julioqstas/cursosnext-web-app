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
    .select('id, title')
    .eq('id', courseId)
    .single()

  if (!course) notFound()

  const { data: modules } = await admin
    .from('modules')
    .select('id, title, order_index')
    .eq('course_id', courseId)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  const moduleIds = (modules ?? []).map((m) => m.id)
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
  const moduleOrderMap = Object.fromEntries((modules ?? []).map((m) => [m.id, m.order_index]))
  const allLessons: LessonWithModule[] = (lessons ?? []).map((l) => ({
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
  const moduleGroups = (modules ?? []).map((mod) => ({
    ...mod,
    lessons: allLessons
      .filter((l) => l.module_id === mod.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((l) => ({
        ...l,
        unlocked: isLessonUnlocked(l, enrollment, overrides ?? [], allLessons, completedIds),
        completed: completedIds.has(l.id),
        isCurrent: l.id === lessonId,
      })),
  }))

  const markComplete = markLessonCompleteAction.bind(null, lessonId, courseId)

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top nav */}
      <header className="bg-gray-900 border-b border-gray-800 h-16 flex items-center px-4 sm:px-8 gap-4 sticky top-0 z-20">
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">Volver</span>
        </Link>
        <div className="h-6 w-px bg-gray-800 mx-2"></div>
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-white font-bold tracking-wide">{course.title}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left: Video + Content (approx 65-70%) */}
        <div className="flex-1 min-w-0 w-full">
          {/* Video Container */}
          <div className="rounded-2xl overflow-hidden bg-black shadow-2xl mb-8 border border-gray-800">
            {currentLesson.youtube_id ? (
              <YouTubePlayer youtubeId={currentLesson.youtube_id} title={currentLesson.title} />
            ) : (
              <div className="aspect-video flex items-center justify-center text-gray-600 bg-gray-900">Sin video</div>
            )}
          </div>

          {/* Lesson Metadata & Content */}
          <div className="mb-10 lg:pr-8">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 tracking-wider mb-3 uppercase">
              <span>MÓDULO {modules.findIndex(m => m.id === currentLesson.module_id) + 1}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400 font-medium tracking-normal">Lección {currentLesson.order_index} de {allLessons.length}</span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-white mb-6 tracking-tight">{currentLesson.title}</h1>
            
            {/* Instructor / Key Takeaways generic block */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8 items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/30">
                {course.title.charAt(0)}
              </div>
              <div>
                <p className="text-white font-medium text-sm">Instructor</p>
                <p className="text-gray-400 text-xs">ISIMOVA Academy</p>
              </div>
            </div>

            {/* Markdown text */}
            <div className="text-gray-300 leading-relaxed text-base prose prose-invert max-w-none prose-indigo">
              {currentLesson.content_md ? (
                <div className="whitespace-pre-wrap">{currentLesson.content_md}</div>
              ) : (
                <p className="italic text-gray-500">Sin contenido adicional dictado para esta lección.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sidebar Cards (approx 30-35%) */}
        <aside className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6 sticky top-24">
          
          {/* Progress Card */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white text-xs font-bold tracking-wider uppercase">Progreso del Curso</h3>
              <span className="text-indigo-400 font-bold">{allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-950 rounded-full h-2 mb-3 border border-gray-800">
              <div 
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${allLessons.length > 0 ? (completedIds.size / allLessons.length) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>{completedIds.size} de {allLessons.length} lecciones</span>
              <span>{allLessons.length - completedIds.size} restantes</span>
            </div>
          </div>

          {/* Syllabus Card */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-md flex flex-col overflow-hidden max-h-[60vh]">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900 z-10">
              <h3 className="text-white text-xs font-bold tracking-wider uppercase">Contenido del Curso</h3>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <LessonAccordion courseId={courseId} modules={moduleGroups} />
            </div>
          </div>

          {/* Complete Button */}
          {!isCompleted && (
            <form action={markComplete}>
              <button type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] uppercase tracking-wide flex items-center justify-center gap-2">
                Completar y Continuar
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          )}
          
          {isCompleted && (
            <div className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Lección Completada
            </div>
          )}

        </aside>
      </main>
    </div>
  )
}
