'use client'

import { useActionState, useState, useEffect } from 'react'
import { loginAction } from '@/app/actions/auth'

// Brand assets
const LOGO_COLOR = 'https://isimova.com/assets/img/Isimova-Color-Horizontal.png'
const WA_LINK = 'https://wa.me/51913279269?text=Hola%20Isimova,%20deseo%20m%C3%A1s%20informaci%C3%B3n%20'

const SLIDES = [
  {
    tagline: 'Biblioteca de Cursos',
    title: 'Aprende. Certifícate. Lidera.',
    desc: 'Accede a más de 1200 horas académicas con metodología práctica y casos reales aplicables desde el primer módulo.',
  },
  {
    tagline: 'Respaldo Universitario',
    title: 'Certificaciones con Validez Nacional',
    desc: 'Diplomas avalados por la Universidad Nacional de Trujillo y la Univ. San Luis Gonzaga. Válidos para MINSA y EsSalud.',
  },
  {
    tagline: 'Acompañamiento Continuo',
    title: 'No Estudias Solo.',
    desc: 'Un equipo de docentes con experiencia real en el sector te guía durante todo el diplomado — no solo teoría.',
  },
]

// ─── Slideshow with glassmorphism card ───────────────────────────────────────
function BrandSlideshow({ dark = false }: { dark?: boolean }) {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setActive(prev => (prev + 1) % SLIDES.length)
        setVisible(true)
      }, 300)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const slide = SLIDES[active]
  const titleColor = dark ? 'text-white' : 'text-slate-900'
  const taglineColor = 'text-primary'
  const descColor = dark ? 'text-white/70' : 'text-slate-600'
  const borderAccent = 'border-primary/40'

  return (
    <div className="flex flex-col gap-4">
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 300ms ease, transform 300ms ease',
        }}
      >
        <p className={`${taglineColor} text-xs font-bold tracking-[0.2em] uppercase mb-2`}>
          {slide.tagline}
        </p>
        <h2 className={`${titleColor} text-2xl lg:text-3xl font-black tracking-tight leading-snug mb-3`}>
          {slide.title}
        </h2>
        <p className={`${descColor} text-sm leading-relaxed border-l-2 ${borderAccent} pl-3`}>
          {slide.desc}
        </p>
      </div>

      {/* Dot indicators */}
      <div className="flex gap-2 mt-1">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActive(i); setVisible(true) }}
            aria-label={`Slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              height: '3px',
              width: i === active ? '24px' : '6px',
              background: i === active ? 'var(--color-primary, #f97316)' : 'rgba(0,0,0,0.15)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Shared form fields ───────────────────────────────────────────────────────
function LoginForm({
  action,
  pending,
  stateError,
  dniId,
  passwordId,
}: {
  action: (payload: FormData) => void
  pending: boolean
  stateError?: string | null
  dniId: string
  passwordId: string
}) {
  return (
    <form action={action} className="space-y-5">
      <div>
        <label
          htmlFor={dniId}
          className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
        >
          DNI
        </label>
        <input
          id={dniId}
          name="dni"
          required
          type="text"
          inputMode="numeric"
          pattern="\d{8}"
          maxLength={8}
          minLength={8}
          placeholder="12345678"
          className="w-full rounded-xl bg-white border border-slate-200 py-3.5 px-4 text-slate-900 placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium shadow-sm"
        />
      </div>

      <div>
        <label
          htmlFor={passwordId}
          className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
        >
          Contraseña
        </label>
        <input
          id={passwordId}
          name="password"
          required
          type="password"
          placeholder="••••••••"
          className="w-full rounded-xl bg-white border border-slate-200 py-3.5 px-4 text-slate-900 placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium shadow-sm"
        />
      </div>

      {stateError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs font-bold text-red-600 uppercase tracking-wide">{stateError}</p>
        </div>
      )}

      <button
        disabled={pending}
        type="submit"
        className="w-full py-4 bg-primary hover:bg-primary-variant text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
      >
        {pending ? '···' : 'Iniciar Sesión'}
      </button>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sheetOpen])

  return (
    <div className="min-h-dvh font-sans antialiased">

      {/* ══════════════════════════════════════
          DESKTOP LAYOUT (md+)
          Light split: Image+Slideshow | Form
      ══════════════════════════════════════ */}
      <div className="hidden md:flex min-h-dvh bg-slate-50">

        {/* ── Left: Brand panel ──────────────── */}
        <div className="w-1/2 relative flex flex-col overflow-hidden">

          {/* Full-bleed brand image */}
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://isimova.com/landings/v2/img/profesional-diplimado.png?v=2"
              alt="Profesional certificada ISIMOVA"
              className="w-full h-full object-cover object-center"
            />
            {/* Subtle light overlay so text is readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/80" />
          </div>

          {/* Logo top-left (over image) */}
          <div className="relative z-10 p-10">
            <a href="https://isimova.com" tabIndex={-1}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_COLOR} alt="ISIMOVA" className="h-10 w-auto object-contain drop-shadow-sm" />
            </a>
          </div>

          {/* ── Glassmorphism slideshow card ── */}
          {/* Positioned in the lower-center of the panel, NOT at the very bottom */}
          <div className="relative z-10 flex-1 flex items-end pb-16 px-10">
            <div
              className="w-full rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <BrandSlideshow dark={false} />
            </div>
          </div>
        </div>

        {/* ── Right: Form panel ──────────────── */}
        <div className="w-1/2 flex flex-col justify-center items-center bg-white relative px-12 lg:px-16 py-12">

          {/* Subtle brand stripe at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-isimova-blue via-primary to-isimova-blue opacity-60" />

          {/* Glassmorphism form card */}
          <div
            className="w-full max-w-sm rounded-3xl p-8"
            style={{
              background: 'rgba(248,250,252,0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(226,232,240,0.8)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
            }}
          >
            {/* Logo inside card */}
            <a href="https://isimova.com" className="inline-block mb-7" tabIndex={-1}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_COLOR} alt="ISIMOVA" className="h-9 w-auto object-contain" />
            </a>

            <div className="mb-6">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight mb-1">
                Ingresa a tu cuenta
              </h1>
              <p className="text-slate-500 text-sm">
                Continúa tu camino hacia la certificación.
              </p>
            </div>

            <LoginForm
              action={action}
              pending={pending}
              stateError={state?.error}
              dniId="dni-desktop"
              passwordId="password-desktop"
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MOBILE LAYOUT (< md)
          Light background, centered logo, square image
      ══════════════════════════════════════ */}
      <div className="md:hidden min-h-dvh flex flex-col relative overflow-hidden bg-gradient-to-b from-slate-100 to-white">

        {/* Subtle background glow orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-48 left-0 w-48 h-48 bg-isimova-blue/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none" />

        {/* ── Mobile header: logo CENTERED ── */}
        <div className="relative z-10 flex justify-center px-6 pt-12 pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_COLOR} alt="ISIMOVA" className="h-9 w-auto object-contain" />
        </div>

        {/* ── Brand image SQUARE ── */}
        <div className="relative z-10 px-6 mt-2">
          <div className="w-full aspect-square rounded-2xl overflow-hidden ring-1 ring-slate-200/60 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://isimova.com/landings/v2/img/profesional-diplimado.png?v=2"
              alt="Profesional ISIMOVA"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* ── Glassmorphism slideshow card (mobile) ── */}
        <div className="relative z-10 px-6 mt-5 flex-1 flex flex-col justify-center">
          <div
            className="w-full rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,1)',
            }}
          >
            <BrandSlideshow dark={false} />
          </div>
        </div>

        {/* ── CTA button — NO "ver planes" text ── */}
        <div className="relative z-10 px-6 pb-10 pt-5">
          <button
            id="open-login-btn"
            onClick={() => setSheetOpen(true)}
            className="w-full py-4 bg-primary hover:bg-primary-variant text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-between px-5"
          >
            <span>Ingresar a mi cuenta</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          BOTTOM SHEET (Mobile only)
      ══════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        onClick={() => setSheetOpen(false)}
        className="md:hidden fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.45)',
          opacity: sheetOpen ? 1 : 0,
          pointerEvents: sheetOpen ? 'auto' : 'none',
        }}
      />

      {/* Sheet */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl"
        style={{
          transform: sheetOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 450ms cubic-bezier(0.32, 0.72, 0, 1)',
          maxHeight: '90dvh',
          overflowY: 'auto',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.18)',
        }}
      >
        {/* Handle pill */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
        </div>

        <div className="px-7 pb-10 pt-3">
          {/* Sheet header */}
          <div className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_COLOR} alt="ISIMOVA" className="h-8 w-auto object-contain mb-5" />
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">
              Ingresa a tu cuenta
            </h2>
            <p className="text-slate-500 text-sm">Continúa tu camino hacia la certificación.</p>
          </div>

          <LoginForm
            action={action}
            pending={pending}
            stateError={state?.error}
            dniId="dni-mobile"
            passwordId="password-mobile"
          />

          <button
            onClick={() => setSheetOpen(false)}
            className="w-full mt-4 py-3 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          WhatsApp FAB
      ══════════════════════════════════════ */}
      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        id="wa-fab"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-45 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-xl shadow-green-900/20 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
        style={{ display: sheetOpen ? 'none' : 'flex' }}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  )
}
