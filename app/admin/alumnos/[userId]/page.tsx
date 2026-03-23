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

    const moduleIds = modules.map((m: any) => m.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawLessons } = moduleIds.length > 0
      ? await admin.from('lessons').select('*').in('module_id', moduleIds).eq('is_active', true).order('order_index')
      : { data: [] as unknown[] }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawOverrides } = await (admin.from('lesson_overrides') as any)
      .select('*')
      .eq('enrollment_id', enrollment.id)

    const moduleOrderMap = Object.fromEntries(modules.map((m: any) => [m.id, m.order_index]))
    const allLessons: LessonWithModule[] = ((rawLessons ?? []) as import('@/lib/database.types').Lesson[]).map((l: any) => ({
      ...l,
      moduleOrderIndex: moduleOrderMap[l.module_id] ?? 0,
    }))

    allLessons.sort((a, b) => {
      if (a.moduleOrderIndex !== b.moduleOrderIndex) {
        return a.moduleOrderIndex - b.moduleOrderIndex
      }
      return a.order_index - b.order_index
    })

    enrollmentDetails.push({
      enrollment,
      allLessons,
      overrides: (rawOverrides ?? []) as LessonOverride[],
      completedIds,
    })
  }

  return (
    <div className="min-h-dvh bg-surface text-on-surface font-sans antialiased">
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link href="/admin/alumnos" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/20 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-on-surface font-bold text-lg tracking-wide">Ficha del Alumno: <span className="text-primary font-black ml-1">{profile.full_name}</span></h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* Profile card */}
        <div className="bg-surface-container-low rounded-3xl p-8 shadow-xl shadow-black/20 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { label: 'Nombre Completo', value: profile.full_name },
            { label: 'Documento Nacional', value: profile.dni },
            { label: 'Rol del Sistema', value: profile.role },
            { label: 'Estado Actual', value: profile.is_active ? 'Activo' : 'Inactivo' },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-on-surface-variant font-bold text-xs mb-2 uppercase tracking-widest">{f.label}</p>
              <p className="text-on-surface font-bold text-lg">{String(f.value)}</p>
            </div>
          ))}
        </div>

        <EnrollForm userId={userId} courses={availableCourses ?? []} />

        {/* Enrollments */}
        {enrollmentDetails.length === 0 ? (
          <p className="text-on-surface-variant/70 font-light italic">Este alumno no tiene matrículas activas.</p>
        ) : (
          <div className="space-y-8">
            {enrollmentDetails.map(({ enrollment, allLessons, overrides }) => {
              const course = enrollment.courses!

              return (
                <div key={enrollment.id} className="bg-surface-container-low rounded-3xl overflow-hidden shadow-2xl shadow-black/20 pb-4">
                  {/* Enrollment header */}
                  <div className="px-8 py-8 bg-surface-container-highest/20 flex items-center justify-between flex-wrap gap-4 rounded-t-3xl">
                    <div>
                      <h2 className="text-on-surface font-black text-2xl tracking-wide leading-tight">{course.title}</h2>
                      <p className="text-on-surface-variant font-medium text-xs mt-2 uppercase tracking-widest">
                        Matriculado: <span className="text-white/60 mr-2">{new Date(enrollment.enrolled_at).toLocaleDateString('es-PE')}</span> • 
                        <span className="ml-2">Frecuencia Drip:</span> <span className="text-white/60 mr-2">{enrollment.drip_interval_days} días</span> • 
                        <span className="ml-2">Vencimiento:</span> <span className="text-white/60">{enrollment.expires_at ? new Date(enrollment.expires_at).toLocaleDateString('es-PE') : 'Sin fecha'}</span>
                      </p>
                    </div>
                    <EnrollmentActions
                      enrollmentId={enrollment.id}
                      userId={userId}
                      status={enrollment.status}
                    />
                  </div>

                  {/* Lessons table */}
                  <div className="overflow-x-auto px-4 mt-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left px-6 py-4 text-on-surface-variant font-bold text-xs uppercase tracking-widest border-b border-white/5">Lección del Curso</th>
                          <th className="text-left px-6 py-4 text-on-surface-variant font-bold text-xs uppercase tracking-widest border-b border-white/5">Estado de Acceso</th>
                          <th className="text-left px-6 py-4 text-on-surface-variant font-bold text-xs uppercase tracking-widest border-b border-white/5">Fecha de Desbloqueo</th>
                          <th className="text-left px-6 py-4 text-on-surface-variant font-bold text-xs uppercase tracking-widest border-b border-white/5">Sobrescribir Restricción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allLessons.map((lesson) => {
                          const unlocked = isLessonUnlocked(lesson, enrollment, overrides, allLessons, completedIds)
                          const override = overrides.find((o) => o.lesson_id === lesson.id)
                          const isCompleted = completedIds.has(lesson.id)

                          let unlockLabel = 'Acceso Libre'
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
                            <tr key={lesson.id} className="hover:bg-surface-container-highest/30 transition-colors border-b border-white/5 last:border-b-0">
                              <td className="px-6 py-4 text-on-surface font-medium truncate max-w-[200px]" title={lesson.title}>{lesson.title}</td>
                              <td className="px-6 py-4">
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${
                                  isCompleted
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : unlocked
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-surface-container-highest text-on-surface-variant/60'
                                }`}>
                                  {isCompleted ? '✓ Completada' : unlocked ? 'Desbloqueada' : 'Bloqueada'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-on-surface-variant font-medium text-xs tracking-wider">
                                {override ? (
                                  <span className="text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-md">
                                    Override: {new Date(override.manual_unlock_date).toLocaleDateString('es-PE')}
                                  </span>
                                ) : (
                                  unlockLabel
                                )}
                              </td>
                              <td className="px-6 py-4">
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
