'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null)

  return (
    <div className="min-h-dvh bg-surface text-on-surface font-sans selection:bg-primary/30 antialiased overflow-hidden relative">
      {/* Auth Shell Background */}
      <div className="fixed inset-0 bg-[linear-gradient(135deg,#250a00_0%,#0c1324_100%)] flex items-center justify-center p-4 md:p-8">

        {/* Fluid Modal Container */}
        <main className="relative w-full max-w-5xl h-[min(800px,90vh)] bg-surface-container-low rounded-xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col md:flex-row border border-white/5">

          {/* Left Column: Branded Visual (Desktop Only) */}
          <section className="hidden md:flex w-1/2 relative bg-surface-container-highest flex-col justify-end p-12 overflow-hidden">
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Isimova Academia"
                className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
                src="https://isimova.com/landings/v2/img/profesional-diplimado.png?v=2"
              />
              <div className="absolute inset-0 bg-linear-to-t from-surface-container-low via-transparent to-transparent"></div>
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-[2px] bg-primary"></span>
                <span className="text-primary text-xs tracking-[0.2em] font-bold uppercase"></span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-on-surface leading-none">
                Academia<br /><span className="text-primary">Isimova</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-sm font-medium leading-relaxed">
                Únete a una comunidad de estudiantes de élite en un entorno digital enfocado en resultados.
              </p>
            </div>
          </section>

          {/* Right Column: Authentication Form */}
          <section className="flex-1 flex flex-col justify-center items-center px-8 sm:px-12 md:px-16 py-12 bg-surface-container-low w-full overflow-y-auto">
            <div className="w-full max-w-md space-y-10">
              {/* Form Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-on-surface">Te damos la bienvenida</h2>
                <p className="text-on-surface-variant font-medium">Continúa tu camino hacia la maestría.</p>
              </div>

              {/* Form */}
              <form action={action} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary" htmlFor="dni">Documento Nacional (DNI)</label>
                  <input
                    className="w-full bg-surface-container-lowest border-none rounded-xl py-4 px-5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] focus:shadow-[0_0_0_1px_rgba(255,182,144,0.2),0_0_15px_2px_rgba(255,182,144,0.04)] outline-none transition-all font-medium tracking-wider"
                    id="dni"
                    name="dni"
                    required
                    pattern="\d{8}"
                    maxLength={8}
                    minLength={8}
                    inputMode="numeric"
                    placeholder="12345678"
                    type="text"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold uppercase tracking-widest text-primary" htmlFor="password">Contraseña</label>
                  </div>
                  <input
                    className="w-full bg-surface-container-lowest border-none rounded-xl py-4 px-5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] focus:shadow-[0_0_0_1px_rgba(255,182,144,0.2),0_0_15px_2px_rgba(255,182,144,0.04)] outline-none transition-all font-medium"
                    id="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    type="password"
                  />
                </div>

                {state?.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wide">{state.error}</p>
                  </div>
                )}

                <button
                  disabled={pending}
                  className="w-full py-4 bg-linear-to-r from-primary to-on-primary-container text-primary-container font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                  type="submit"
                >
                  {pending ? '...' : 'Ingresar'}
                </button>
              </form>

              {/* Form Footer */}
              <p className="text-center text-sm text-on-surface-variant">
                ¿Aún no tienes cuenta?
                <span className="text-primary font-bold hover:underline underline-offset-4 ml-1 cursor-pointer">Ver planes de estudio</span>
              </p>
            </div>
          </section>
        </main>

        {/* Mobile Visual Handle (Design Intent Reference) */}
        <div className="md:hidden fixed bottom-6 left-0 w-full flex justify-center z-50 pointer-events-none">
          <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
        </div>
      </div>

      {/* Background Elements for Ambience */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-on-primary-container/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
    </div>
  )
}
