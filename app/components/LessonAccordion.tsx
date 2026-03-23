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
    <div className="divide-y divide-gray-800">
      {modules.map((mod) => {
        const isOpen = openModuleId === mod.id
        const completedCount = mod.lessons.filter((l) => l.completed).length

        return (
          <div key={mod.id}>
            {/* Module header */}
            <button
              onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
              className="w-full text-left px-4 py-3 flex items-center justify-between
                         hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{mod.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {completedCount}/{mod.lessons.length} completadas
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Lessons list */}
            {isOpen && (
              <ul className="bg-gray-950/50">
                {mod.lessons.map((lesson) => {
                  if (!lesson.unlocked) {
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-3 px-5 py-3 opacity-50 pointer-events-none select-none"
                      >
                        <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-gray-400 text-sm truncate">{lesson.title}</span>
                      </li>
                    )
                  }

                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/cursos/${courseId}/leccion/${lesson.id}`}
                        className={`flex items-center gap-3 px-5 py-3 transition-colors
                          ${lesson.isCurrent
                            ? 'bg-indigo-600/20 border-l-2 border-indigo-500'
                            : 'hover:bg-gray-800/50 border-l-2 border-transparent'
                          }`}
                      >
                        {lesson.completed ? (
                          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <span className={`text-sm truncate ${lesson.isCurrent ? 'text-white font-medium' : 'text-gray-300'}`}>
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
