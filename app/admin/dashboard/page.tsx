import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logoutAction } from '@/app/actions/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Metrics
  const admin = createAdminClient()
  const [
    { count: totalStudents },
    { count: activeCourses },
    { count: activeEnrollments },
    { count: pausedEnrollments },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('is_active', true),
    admin.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('is_published', true),
    admin.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'paused'),
  ])

  const metrics = [
    { label: 'Alumnos activos', value: totalStudents ?? 0, color: 'indigo', href: '/admin/alumnos' },
    { label: 'Cursos publicados', value: activeCourses ?? 0, color: 'violet', href: '/admin/cursos' },
    { label: 'Matrículas activas', value: activeEnrollments ?? 0, color: 'emerald', href: '/admin/alumnos' },
    { label: 'Matrículas pausadas', value: pausedEnrollments ?? 0, color: 'yellow', href: '/admin/alumnos' },
  ]

  return (
    <div className="min-h-dvh bg-surface text-on-surface font-sans antialiased">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-on-surface text-lg tracking-tight">ISIMOVA Academy</span>
            <span className="text-white/10">|</span>
            <span className="text-primary text-sm font-bold tracking-widest uppercase">Admin</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/admin/alumnos" className="text-on-surface-variant hover:text-primary font-medium text-sm transition-colors">Alumnos</Link>
            <Link href="/admin/cursos" className="text-on-surface-variant hover:text-primary font-medium text-sm transition-colors">Cursos</Link>
            <div className="h-4 w-px bg-white/10"></div>
            <form action={logoutAction}>
              <button type="submit" className="text-on-surface-variant hover:text-primary font-bold text-sm tracking-wide transition-colors">
                SALIR
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold text-on-surface mb-10 tracking-tight">Panel de Control</h1>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((m: any) => (
            <Link
              key={m.label}
              href={m.href}
              className="bg-surface-container-low rounded-3xl p-8 shadow-xl shadow-black/20 hover:bg-surface-container-highest hover:-translate-y-1 transition-all duration-300 group"
            >
              <p className="text-on-surface-variant font-medium text-sm mb-3 uppercase tracking-widest">{m.label}</p>
              <p className="text-5xl font-extrabold text-on-surface group-hover:text-primary transition-colors">
                {m.value}
              </p>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/admin/alumnos"
            className="flex items-center gap-6 bg-surface-container-low rounded-3xl p-8 shadow-xl shadow-black/20 hover:bg-surface-container-highest hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-on-surface font-bold text-xl mb-1 group-hover:text-primary transition-colors">Gestionar Alumnos</h2>
              <p className="text-on-surface-variant font-light text-sm">Crear, matricular, pausar, gestionar accesos dictados</p>
            </div>
          </Link>

          <Link href="/admin/cursos"
            className="flex items-center gap-6 bg-surface-container-low rounded-3xl p-8 shadow-xl shadow-black/20 hover:bg-surface-container-highest hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-on-surface font-bold text-xl mb-1 group-hover:text-emerald-400 transition-colors">Gestionar Cursos</h2>
              <p className="text-on-surface-variant font-light text-sm">Cursos, módulos y lecciones del currículum</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
