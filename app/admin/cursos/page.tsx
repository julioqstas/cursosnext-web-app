import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logoutAction } from '@/app/actions/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import CourseForm from '@/app/components/admin/CourseForm'
import ModuleForm from '@/app/components/admin/ModuleForm'
import LessonForm from '@/app/components/admin/LessonForm'
import { CourseItem, ModuleItem, LessonItem } from '@/app/components/admin/CurriculumItems'

export default async function AdminCursosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: courses } = await admin
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // For each course, load modules and their lessons
  const courseDetails = await Promise.all(
    (courses ?? []).map(async (course: any) => {
      const { data: modules } = await admin
        .from('modules')
        .select('*, lessons(*)')
        .eq('course_id', course.id)
        .eq('is_active', true)
        .order('order_index', { ascending: true })

      return {
        ...course,
        modules: (modules ?? []).map((m: any) => ({
          ...m,
          lessons: (m.lessons ?? []).filter((l: any) => l.is_active).sort((a: any, b: any) => a.order_index - b.order_index),
        })),
      }
    })
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-white font-semibold">Gestión de Cursos</h1>
          </div>
          <nav className="flex items-center gap-6">
            <form action={logoutAction}>
              <button type="submit" className="text-gray-400 hover:text-white text-sm transition-colors">
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create course form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-5">Nuevo curso</h2>
              <CourseForm />
            </div>
          </div>

          {/* Course list */}
          <div className="lg:col-span-2 space-y-4">
            {courseDetails.length === 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center text-gray-500 text-sm">
                No hay cursos. Crea uno.
              </div>
            )}
            {courseDetails.map((course: any) => (
              <CourseItem key={course.id} course={course}>
                {course.modules.map((mod: any) => (
                  <ModuleItem key={mod.id} module={mod}>
                    {mod.lessons.map((lesson: any) => (
                      <LessonItem key={lesson.id} lesson={lesson} />
                    ))}
                    {mod.lessons.length === 0 && (
                      <li className="py-2.5 text-gray-600 text-xs px-4">Sin lecciones</li>
                    )}
                    <li className="px-1">
                      <LessonForm moduleId={mod.id} nextOrder={mod.lessons.length > 0 ? mod.lessons[mod.lessons.length - 1].order_index + 1 : 1} />
                    </li>
                  </ModuleItem>
                ))}
                {course.modules.length === 0 && (
                  <p className="text-gray-600 text-sm mb-3">Sin módulos.</p>
                )}
                <ModuleForm courseId={course.id} nextOrder={course.modules.length > 0 ? course.modules[course.modules.length - 1].order_index + 1 : 1} />
              </CourseItem>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
