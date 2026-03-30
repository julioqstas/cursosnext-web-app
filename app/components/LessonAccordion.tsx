'use client'

import { useState } from 'react'
import Link from 'next/link'

interface LessonItem {
  id: string
  title: string
  order_index: number
  unlocked: boolean
  completed: boolean
  isCurrent: boolean
}

interface ModuleGroup {
  id: string
  title: string
  order_index: number
  lessons: LessonItem[]
}

interface LessonAccordionProps {
  courseId: string
  modules: ModuleGroup[]
}

export default function LessonAccordion({ courseId, modules }: LessonAccordionProps) {
  // Default open: the module containing the current lesson
  const defaultOpen = modules.find((m) => m.lessons.some((l) => l.isCurrent))?.id ?? modules[0]?.id
  const [openModuleId, setOpenModuleId] = useState<string | null>(defaultOpen ?? null)

  return (
    <div className="flex flex-col gap-3">
      {modules.map((mod) => {
        const isOpen = openModuleId === mod.id
        const completedCount = mod.lessons.filter((l) => l.completed).length

        return (
          <div key={mod.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            {/* Module header */}
            <button
              onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
              className={`w-full text-left px-5 py-4 flex items-center justify-between transition-colors ${
                isOpen ? 'bg-slate-50/80' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-slate-900 text-[15px] font-black tracking-tight truncate">{mod.title}</p>
                <p className="text-slate-500 text-[13px] mt-0.5 font-bold tracking-wide uppercase">
                  {completedCount}/{mod.lessons.length} completadas
                </p>
              </div>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-white shadow-sm ring-1 ring-slate-200/50' : 'bg-transparent'}`}>
                <svg
                  className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-primary' : ''
                  }`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Lessons list */}
            {isOpen && (
              <ul className="bg-white border-t border-slate-100">
                {mod.lessons.map((lesson) => {
                  if (!lesson.unlocked) {
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-4 px-5 py-3.5 opacity-40 pointer-events-none select-none bg-slate-50/50"
                      >
                        <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-slate-500 text-[14px] truncate font-bold">{lesson.title}</span>
                      </li>
                    )
                  }

                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/cursos/${courseId}/leccion/${lesson.id}`}
                        className={`group flex items-center gap-4 px-5 py-3.5 transition-all
                          ${lesson.isCurrent
                            ? 'bg-primary/5 border-l-[3px] border-primary shadow-[inset_0_0_20px_rgba(249,115,22,0.02)]'
                            : 'hover:bg-slate-50 border-l-[3px] border-transparent'
                          }`}
                      >
                        {lesson.completed ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 ring-4 ring-emerald-50">
                            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-[2.5px] ${lesson.isCurrent ? 'border-primary ring-4 ring-primary/10' : 'border-slate-300 group-hover:border-primary/50 transition-all font-black text-slate-400'}`}>
                            {lesson.isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-primary" /> : <span className="text-[10px]">&nbsp;</span>}
                          </div>
                        )}
                        <span className={`text-[14px] truncate transition-colors ${lesson.isCurrent ? 'text-slate-900 font-black tracking-tight' : 'text-slate-600 font-bold group-hover:text-slate-900'}`}>
                          {lesson.title}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
