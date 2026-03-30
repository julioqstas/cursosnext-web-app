import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/actions/auth'

export const metadata = { title: 'Mi Perfil | ISIMOVA' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch full profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || 'Estudiante Sin Nombre'
  const userInitial = userName.charAt(0).toUpperCase()
  const roleName = profile?.role === 'admin' ? 'Administrador ISIMOVA' : 'Estudiante PRO'

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10 pb-24 w-full animate-in fade-in duration-700 zoom-in-95">
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-black text-isimova-blue tracking-tight mb-2">Mi Perfil</h1>
        <p className="text-slate-500 font-medium text-[15px]">Gestiona tu información personal y credenciales de acceso.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 relative overflow-hidden">
        {/* Background Decorative Mesh */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="w-32 h-32 rounded-full bg-slate-50 border-4 border-white shadow-xl ring-1 ring-slate-200 flex items-center justify-center text-5xl font-black text-isimova-blue/50 relative group overflow-hidden">
              <span className="relative z-10">{userInitial}</span>
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 cursor-pointer backdrop-blur-[2px]">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>
            <span className="bg-primary/10 text-isimova-blue font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-full ring-1 ring-primary/20">
              {roleName}
            </span>
          </div>

          {/* Form Fields Section */}
          <div className="flex-1 w-full space-y-6">
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-500 tracking-wide uppercase ml-1">Nombre Completo</label>
              <div className="w-full bg-slate-50 border border-slate-200 text-isimova-blue font-bold text-[15px] px-5 py-4 rounded-2xl flex items-center">
                 {userName}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-500 tracking-wide uppercase ml-1">Dirección de Correo</label>
              <div className="w-full bg-slate-50 border border-slate-200 text-isimova-blue font-bold text-[15px] px-5 py-4 rounded-2xl flex items-center">
                 {user.email}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-500 tracking-wide uppercase ml-1">ID de Estudiante</label>
              <div className="w-full bg-slate-50 border border-slate-200 text-slate-400 font-mono text-[13px] px-5 py-4 rounded-2xl flex items-center select-all">
                 {user.id}
              </div>
              <p className="text-xs text-slate-400 font-medium ml-1 mt-2">La edición de datos se encuentra temporalmente restringida. Solicita cambios a soporte.</p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
              <form action={logoutAction}>
                <button type="submit" className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-black text-sm px-6 py-3.5 rounded-xl transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Cerrar Sesión Segura
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
