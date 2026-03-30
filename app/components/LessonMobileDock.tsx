'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, LayoutList, ChevronLeft, ChevronRight } from 'lucide-react'
import LessonAccordion from '@/app/components/LessonAccordion'

interface LessonMobileDockProps {
  courseId: string
  prevLessonId: string | null
  nextLessonId: string | null
  modules: any[]
}

export default function LessonMobileDock({
  courseId,
  prevLessonId,
  nextLessonId,
  modules,
}: LessonMobileDockProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      {/* ── Bottom Sheet Backdrop ──────────────────── */}
      <div
        onClick={() => setSheetOpen(false)}
        className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{
          opacity: sheetOpen ? 1 : 0,
          pointerEvents: sheetOpen ? 'auto' : 'none',
        }}
      />

      {/* ── Bottom Sheet (Lesson List) ─────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-slate-50 overflow-hidden flex flex-col"
        style={{
          maxHeight: '80dvh',
          transform: sheetOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 420ms cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Drag pill */}
        <div className="flex justify-center pt-4 pb-2 shrink-0">
          <div className="w-10 h-1.5 bg-slate-300/80 rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-slate-200/60 flex items-center justify-between shrink-0 bg-white/60 backdrop-blur-md">
          <h3 className="text-isimova-blue text-[15px] font-black tracking-tight">Temario del Curso</h3>
          <button
            onClick={() => setSheetOpen(false)}
            className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 rotate-90" />
          </button>
        </div>

        {/* Scrollable Accordion */}
        <div className="overflow-y-auto flex-1 p-4 pb-8">
          <LessonAccordion courseId={courseId} modules={modules} />
        </div>
      </div>

      {/* ── Lesson Dock Bar ────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div
          className="w-full flex items-center justify-between px-3 pt-2 pb-3 mx-3 mb-3 rounded-3xl gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.62), rgba(248,250,252,0.52))',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(200,210,235,0.55)',
            boxShadow: '0 -8px 32px rgba(45,66,133,0.08), 0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          {/* Home */}
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl active:scale-95 transition-all"
          >
            <Home className="w-6 h-6 text-slate-500" strokeWidth={2} />
            <span className="text-[10px] font-black text-slate-400 leading-none">Inicio</span>
          </Link>

          {/* Lesson List (opens bottom sheet) */}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl active:scale-95 transition-all"
          >
            <LayoutList className="w-6 h-6 text-slate-500" strokeWidth={2} />
            <span className="text-[10px] font-black text-slate-400 leading-none">Lecciones</span>
          </button>

          {/* Divider */}
          <div className="w-px h-10 bg-slate-200/80 mx-1 shrink-0" />

          {/* Prev Lesson */}
          <Link
            href={prevLessonId ? `/cursos/${courseId}/leccion/${prevLessonId}` : '#'}
            aria-disabled={!prevLessonId}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all active:scale-95 select-none ${
              !prevLessonId ? 'opacity-30 pointer-events-none' : ''
            }`}
          >
            <ChevronLeft className="w-7 h-7 text-slate-500" strokeWidth={2.5} />
            <span className="text-[10px] font-black text-slate-400 leading-none">Anterior</span>
          </Link>

          {/* Next Lesson (ORANGE CTA) */}
          <Link
            href={nextLessonId ? `/cursos/${courseId}/leccion/${nextLessonId}` : '#'}
            aria-disabled={!nextLessonId}
            className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all active:scale-95 select-none ${
              nextLessonId
                ? 'bg-primary shadow-lg shadow-primary/30 text-white'
                : 'opacity-30 pointer-events-none bg-slate-200'
            }`}
          >
            <ChevronRight className="w-7 h-7" strokeWidth={2.5} />
            <span className="text-[10px] font-black leading-none">Siguiente</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
