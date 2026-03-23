import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logoutAction } from '@/app/actions/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import CreateStudentForm from '@/app/components/admin/CreateStudentForm'

export default async function AdminAlumnosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawStudents } = await (admin.from('profiles') as any)
    .select('*')
    .eq('role', 'student')
    .order('full_name', { ascending: true })

  const students = (rawStudents ?? []) as import('@/lib/database.types').Profile[]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Admin nav */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-white font-semibold">Gestión de Alumnos</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/admin/cursos" className="text-gray-400 hover:text-white text-sm transition-colors">Cursos</Link>
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
          {/* Create student form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-5">Crear nuevo alumno</h2>
              <CreateStudentForm />
            </div>
          </div>

          {/* Students list */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-white font-semibold">Alumnos ({students?.length ?? 0})</h2>
              </div>
              <ul className="divide-y divide-gray-800">
                {(!students || students.length === 0) && (
                  <li className="px-6 py-10 text-center text-gray-500 text-sm">
                    No hay alumnos registrados.
                  </li>
                )}
                {students?.map((student) => (
                  <li key={student.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/40 transition-colors">
                    <div>
                      <p className="text-white font-medium">{student.full_name}</p>
                      <p className="text-gray-500 text-sm">DNI: {student.dni}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        student.is_active
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {student.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                      <Link
                        href={`/admin/alumnos/${student.id}`}
                        className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                      >
                        Gestionar →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
