'use client'

import { useActionState, useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import Link from 'next/link'
import ParticlesBackground from '@/app/components/ParticlesBackground'

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)

  return (
    <main className="bg-surface text-on-surface min-h-dvh flex font-sans antialiased relative">

      {/* OVERLAY MÓVIL */}
      <div 
        onClick={() => setIsMobileSheetOpen(false)}
        className={`fixed inset-0 z-50 bg-surface/80 backdrop-blur-md transition-opacity duration-300 md:hidden ${
          isMobileSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* PANEL FORMULARIO (Left on Desktop, Bottom Sheet on Mobile) */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-60 bg-surface-container-lowest md:bg-transparent rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.65)] md:shadow-none transform transition-transform duration-500 ease-in-out md:relative md:translate-y-0 md:rounded-none md:flex w-full md:w-1/2 flex-col justify-between p-8 md:p-12 lg:p-16 h-auto max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible ${
          isMobileSheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle (Barrita de Swipe) solo visible en móvil */}
        <div className="md:hidden flex justify-center w-full mb-6">
          <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
        </div>

        {/* Brand Header */}
        <div className="hidden md:flex justify-between items-center w-full max-w-md mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20">
            <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        {/* Login Form Content */}
        <div className="w-full max-w-md mx-auto my-auto md:mt-auto">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Ingresa a tu cuenta</h1>
          <p className="text-gray-400 mb-8 text-sm">
            Inicia sesión para continuar aprendiendo en nuestra Biblioteca de Cursos.
          </p>

          <form action={action} className="space-y-5">
            <div>
              <label htmlFor="dni" className="block text-sm font-medium mb-1.5 text-gray-300">
                DNI
              </label>
              <input 
                type="text" 
                id="dni" 
                name="dni"
                required 
                placeholder="12345678" 
                pattern="\d{8}" 
                maxLength={8}
                minLength={8} 
                inputMode="numeric" 
                title="Debe ingresar exactamente 8 números"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-white placeholder-gray-500 tracking-widest" 
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-gray-300">
                Contraseña
              </label>
              <input 
                type="password" 
                id="password" 
                name="password"
                required 
                placeholder="••••••••" 
                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-white placeholder-gray-500" 
              />
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {state.error}
              </div>
            )}

            <button 
              type="submit"
              disabled={pending}
              className="w-full py-4 px-4 bg-linear-to-r from-primary to-primary-variant hover:to-primary-fixed-variant text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            ¿Aún no tienes cuenta? <Link href="#" className="font-bold text-primary hover:text-primary-variant">Ver planes de estudio</Link>
          </p>
        </div>

        <div className="w-full max-w-md mx-auto text-center mt-8">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} ISIMOVA. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* PANEL AFICHE (Right on Desktop, Visual Poster on Mobile) */}
      <div className="flex w-full min-h-dvh md:min-h-0 md:w-1/2 bg-surface relative overflow-hidden flex-col justify-center items-center p-8 md:p-12 text-center border-l border-white/5">
        
        {/* Header superior visible solo en móvil (Logo) */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 md:hidden">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600/20">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        {/* Ambient Lights & Particles */}
        <ParticlesBackground />
        
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-primary rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-lg">
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
              </path>
            </svg>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight tracking-tight">
            Eleva tu perfil profesional al siguiente nivel.
          </h2>
          
          <p className="text-lg text-blue-200/80 mb-10 font-light leading-relaxed">
            Accede a nuestra Biblioteca de Cursos, interactúa con casos reales y obtén certificaciones con validez internacional.
          </p>
          
          <ul className="text-left space-y-4 inline-block">
            <li className="flex items-center text-blue-100">
              <svg className="w-5 h-5 text-emerald-400 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg> 
              Más de 1200 horas académicas.
            </li>
            <li className="flex items-center text-blue-100">
              <svg className="w-5 h-5 text-emerald-400 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg> 
              Acompañamiento estratégico continuo.
            </li>
            <li className="flex items-center text-blue-100">
              <svg className="w-5 h-5 text-emerald-400 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg> 
              Casos de estudio 100% aplicables.
            </li>
          </ul>

          {/* Botonera fija inferior en móvil para abrir el Bottom Sheet */}
          <div className="mt-12 w-full md:hidden flex flex-col gap-4 relative z-50">
            <button 
              onClick={() => setIsMobileSheetOpen(true)}
              className="w-full py-4 px-6 bg-linear-to-r from-primary to-primary-variant text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] flex items-center justify-between transition-transform transform active:scale-[0.98]"
            >
              <span>INGRESAR A MI CUENTA</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <div className="flex justify-center items-center gap-2 text-sm text-blue-200">
              <span>¿No tienes cuenta?</span>
              <Link href="#" className="font-bold text-primary hover:text-primary-variant underline underline-offset-2">Regístrate</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
