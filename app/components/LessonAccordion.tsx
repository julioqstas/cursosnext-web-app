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
    <div className="flex flex-col gap-3 p-2">
      {modules.map((mod) => {
        const isOpen = openModuleId === mod.id
        const completedCount = mod.lessons.filter((l) => l.completed).length

        return (
          <div key={mod.id} className="bg-surface-container-highest/40 rounded-2xl overflow-hidden transition-all duration-300">
            {/* Module header */}
            <button
              onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
              className={`w-full text-left px-5 py-4 flex items-center justify-between transition-colors ${
                isOpen ? 'bg-surface-container-highest' : 'hover:bg-surface-container-highest/80'
              }`}
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-on-surface text-sm font-bold tracking-wide truncate">{mod.title}</p>
                <p className="text-on-surface-variant text-xs mt-1 font-medium">
                  {completedCount}/{mod.lessons.length} completadas
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-white/10' : 'bg-transparent'}`}>
                <svg
                  className={`w-4 h-4 text-on-surface-variant transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-white' : ''
                  }`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Lessons list */}
            {isOpen && (
              <ul className="bg-surface/30">
                {mod.lessons.map((lesson) => {
                  if (!lesson.unlocked) {
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-4 px-5 py-3.5 opacity-50 pointer-events-none select-none"
                      >
                        <svg className="w-5 h-5 text-on-surface-variant shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-on-surface-variant text-sm truncate font-medium">{lesson.title}</span>
                      </li>
                    )
                  }

                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/cursos/${courseId}/leccion/${lesson.id}`}
                        className={`group flex items-center gap-4 px-5 py-3.5 transition-all
                          ${lesson.isCurrent
                            ? 'bg-primary/10 border-l-2 border-primary shadow-[inset_0_0_20px_rgba(249,115,22,0.05)]'
                            : 'hover:bg-surface-container-highest/50 border-l-2 border-transparent'
                          }`}
                      >
                        {lesson.completed ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 ${lesson.isCurrent ? 'border-primary' : 'border-on-surface-variant/40 group-hover:border-primary/50 transition-colors'}`}>
                            {lesson.isCurrent && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                        )}
                        <span className={`text-sm truncate transition-colors ${lesson.isCurrent ? 'text-primary font-bold tracking-wide' : 'text-on-surface-variant font-medium group-hover:text-on-surface'}`}>
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
