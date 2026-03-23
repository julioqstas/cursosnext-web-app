import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isLessonUnlocked } from '@/lib/drip'
import type { LessonWithModule } from '@/lib/drip'
import type { Profile, Enrollment, LessonOverride } from '@/lib/database.types'
import EnrollmentActions from '@/app/components/admin/EnrollmentActions'
import LessonOverrideForm from '@/app/components/admin/LessonOverrideForm'
import EnrollForm from '@/app/components/admin/EnrollForm'

interface PageProps {
  params: Promise<{ userId: string }>
}

interface EnrollmentDetail {
  enrollment: Enrollment & { courses: { id: string; title: string } | null }
  allLessons: LessonWithModule[]
  overrides: LessonOverride[]
  completedIds: Set<string>
}

export default async function AdminAlumnoDetailPage({ params }: PageProps) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profileData } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profileData) notFound()
  const profile = profileData as Profile

  // Enrollments with course data
  const { data: rawEnrollments } = await admin
    .from('enrollments')
    .select('*, courses ( id, title )')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  const enrollments = (rawEnrollments ?? []) as (Enrollment & { courses: { id: string; title: string } | null })[]

  // Fetch available courses for the enrollment form
  const { data: availableCourses } = await admin
    .from('courses')
    .select('id, title')
    .eq('is_active', true)
    .order('title')

  // Fetch progress once
  const { data: progressData } = await admin
    .from('progress')
    .select('lesson_id, is_completed')
    .eq('user_id', userId)
    .eq('is_completed', true)

  const completedIds = new Set(
    ((progressData ?? []) as { lesson_id: string; is_completed: boolean }[]).map((p) => p.lesson_id)
  )

  // Build enrollment details sequentially to avoid async map in JSX
  const enrollmentDetails: EnrollmentDetail[] = []

  for (const enrollment of enrollments) {
    const course = enrollment.courses
    if (!course) continue

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawModules } = await (admin.from('modules') as any)
      .select('*')
      .eq('course_id', course.id)
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    const modules = (rawModules ?? []) as { id: string; title: string; order_index: number; module_id?: string }[]

    const moduleIds = modules.map((m) => m.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawLessons } = moduleIds.length > 0
      ? await admin.from('lessons').select('*').in('module_id', moduleIds).eq('is_active', true).order('order_index')
      : { data: [] as unknown[] }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawOverrides } = await (admin.from('lesson_overrides') as any)
      .select('*')
      .eq('enrollment_id', enrollment.id)

    const moduleOrderMap = Object.fromEntries(modules.map((m) => [m.id, m.order_index]))
    const allLessons: LessonWithModule[] = ((rawLessons ?? []) as import('@/lib/database.types').Lesson[]).map((l) => ({
      ...l,
      moduleOrderIndex: moduleOrderMap[l.module_id] ?? 0,
    }))

    enrollmentDetails.push({
      enrollment,
      allLessons,
      overrides: (rawOverrides ?? []) as LessonOverride[],
      completedIds,
    })
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link href="/admin/alumnos" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-white font-semibold">Detalle: {profile.full_name}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Profile card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Nombre', value: profile.full_name },
            { label: 'DNI', value: profile.dni },
            { label: 'Rol', value: profile.role },
            { label: 'Estado', value: profile.is_active ? 'Activo' : 'Inactivo' },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-gray-500 text-xs mb-1">{f.label}</p>
              <p className="text-white font-medium">{String(f.value)}</p>
            </div>
          ))}
        </div>

        <EnrollForm userId={userId} courses={availableCourses ?? []} />

        {/* Enrollments */}
        {enrollmentDetails.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin matrículas.</p>
        ) : (
          <div className="space-y-6">
            {enrollmentDetails.map(({ enrollment, allLessons, overrides }) => {
              const course = enrollment.courses!

              return (
                <div key={enrollment.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  {/* Enrollment header */}
                  <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-white font-semibold">{course.title}</h2>
                      <p className="text-gray-500 text-sm">
                        Matriculado: {new Date(enrollment.enrolled_at).toLocaleDateString('es-PE')} ·
                        Drip: {enrollment.drip_interval_days} días ·
                        Vence: {enrollment.expires_at ? new Date(enrollment.expires_at).toLocaleDateString('es-PE') : 'Sin fecha'}
                      </p>
                    </div>
                    <EnrollmentActions
                      enrollmentId={enrollment.id}
                      userId={userId}
                      status={enrollment.status}
                    />
                  </div>

                  {/* Lessons table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="text-left px-6 py-3 text-gray-400 font-medium">Lección</th>
                          <th className="text-left px-6 py-3 text-gray-400 font-medium">Estado</th>
                          <th className="text-left px-6 py-3 text-gray-400 font-medium">Desbloqueo</th>
                          <th className="text-left px-6 py-3 text-gray-400 font-medium">Override</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {allLessons.map((lesson) => {
                          const unlocked = isLessonUnlocked(lesson, enrollment, overrides, allLessons, completedIds)
                          const override = overrides.find((o) => o.lesson_id === lesson.id)
                          const isCompleted = completedIds.has(lesson.id)

                          let unlockLabel = 'Libre'
                          if (enrollment.drip_interval_days > 0 && !override) {
                            const sorted = [...allLessons].sort((a, b) =>
                              a.moduleOrderIndex !== b.moduleOrderIndex
                                ? a.moduleOrderIndex - b.moduleOrderIndex
                                : a.order_index - b.order_index
                            )
                            const idx = sorted.findIndex((l) => l.id === lesson.id)
                            const unlockDate = new Date(
                              new Date(enrollment.enrolled_at).getTime() +
                              idx * enrollment.drip_interval_days * 86400000
                            )
                            unlockLabel = unlockDate.toLocaleDateString('es-PE')
                          }

                          return (
                            <tr key={lesson.id} className="hover:bg-gray-800/30 transition-colors">
                              <td className="px-6 py-3 text-gray-200">{lesson.title}</td>
                              <td className="px-6 py-3">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : unlocked
                                    ? 'bg-indigo-500/20 text-indigo-400'
                                    : 'bg-gray-700 text-gray-400'
                                }`}>
                                  {isCompleted ? '✓ Completada' : unlocked ? 'Desbloqueada' : '🔒 Bloqueada'}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-gray-400 text-xs">
                                {override ? (
                                  <span className="text-yellow-400">
                                    Override: {new Date(override.manual_unlock_date).toLocaleDateString('es-PE')}
                                  </span>
                                ) : (
                                  unlockLabel
                                )}
                              </td>
                              <td className="px-6 py-3">
                                <LessonOverrideForm
                                  enrollmentId={enrollment.id}
                                  lessonId={lesson.id}
                                  userId={userId}
                                  currentOverride={override ?? null}
                                />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
