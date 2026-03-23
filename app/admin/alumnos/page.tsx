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
    <div className="min-h-dvh bg-surface text-on-surface font-sans antialiased">
      {/* Admin nav */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/20 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-on-surface font-bold text-lg tracking-wide">Gestión de Alumnos</h1>
          </div>
          <nav className="flex items-center gap-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Create student form */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-low rounded-3xl p-8 shadow-xl shadow-black/20 sticky top-28">
              <h2 className="text-on-surface font-extrabold text-xl mb-6 tracking-wide">Crear nuevo alumno</h2>
              <CreateStudentForm />
            </div>
          </div>

          {/* Students list */}
          <div className="lg:col-span-2">
            <div className="bg-surface-container-low rounded-3xl overflow-hidden shadow-xl shadow-black/20">
              <div className="px-8 py-6 bg-surface-container-highest/20">
                <h2 className="text-on-surface font-bold text-lg">Directorio de Alumnos <span className="text-primary ml-2 bg-primary/10 px-2.5 py-1 rounded-full text-sm">{students?.length ?? 0}</span></h2>
              </div>
              <ul className="px-4 pb-4 space-y-2 pt-2">
                {(!students || students.length === 0) && (
                  <li className="px-8 py-16 text-center text-on-surface-variant font-light italic">
                    No hay alumnos registrados. Crea el primero.
                  </li>
                )}
                {students?.map((student) => (
                  <li key={student.id}
                    className="flex items-center justify-between p-5 bg-surface-container-highest/20 rounded-2xl transition-all hover:bg-surface-container-highest/60 hover:-translate-y-0.5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl shadow-[inset_0_0_15px_rgba(249,115,22,0.2)]">
                        {student.full_name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="text-on-surface font-bold text-lg tracking-wide">{student.full_name}</p>
                        <p className="text-on-surface-variant font-medium text-sm mt-0.5 tracking-widest">DNI: <span className="text-white/60">{student.dni}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${
                        student.is_active
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {student.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                      <Link
                        href={`/admin/alumnos/${student.id}`}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Gestionar Alumno"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
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
