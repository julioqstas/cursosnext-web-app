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
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-semibold text-white">ISIMOVA Academy</span>
            <span className="text-gray-700">|</span>
            <span className="text-indigo-400 text-sm font-medium">Admin</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/admin/alumnos" className="text-gray-300 hover:text-white text-sm transition-colors">Alumnos</Link>
            <Link href="/admin/cursos" className="text-gray-300 hover:text-white text-sm transition-colors">Cursos</Link>
            <form action={logoutAction}>
              <button type="submit" className="text-gray-400 hover:text-white text-sm transition-colors">
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">Panel de Control</h1>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {metrics.map((m: any) => (
            <Link
              key={m.label}
              href={m.href}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6
                         hover:border-indigo-500 transition-all duration-300 group"
            >
              <p className="text-gray-400 text-sm mb-2">{m.label}</p>
              <p className={`text-4xl font-bold text-white group-hover:text-indigo-400 transition-colors`}>
                {m.value}
              </p>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/admin/alumnos"
            className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-6
                       hover:border-indigo-500 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-semibold">Gestionar Alumnos</h2>
              <p className="text-gray-400 text-sm">Crear, matricular, pausar, gestionar overrides</p>
            </div>
          </Link>

          <Link href="/admin/cursos"
            className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-6
                       hover:border-indigo-500 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-semibold">Gestionar Cursos</h2>
              <p className="text-gray-400 text-sm">Cursos, módulos, lecciones</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
