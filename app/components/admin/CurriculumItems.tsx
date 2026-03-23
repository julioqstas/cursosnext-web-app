'use client'

import { useState } from 'react'
import CourseForm from './CourseForm'
import ModuleForm from './ModuleForm'
import LessonForm from './LessonForm'
import { softDeleteCourseAction, softDeleteModuleAction, softDeleteLessonAction } from '@/app/actions/courses'

export function CourseItem({ course, children }: { course: any, children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (isEditing) {
    return (
      <div className="bg-surface-container-highest rounded-3xl p-8 mb-6 shadow-2xl shadow-primary/10 ring-1 ring-inset ring-primary/30 transition-all">
        <h2 className="text-on-surface font-extrabold mb-6 flex items-center gap-3 text-lg">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Editando Curso
        </h2>
        <CourseForm initialData={course} onCancel={() => setIsEditing(false)} />
      </div>
    )
  }

  if (isDeleting) {
    return (
      <div className="bg-surface-container-highest rounded-3xl p-8 mb-6 opacity-60 flex items-center justify-center">
        <span className="text-on-surface-variant animate-pulse font-medium tracking-wide">Eliminando curso...</span>
      </div>
    )
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (confirm('¿Estás seguro de eliminar este curso? Se ocultarán todos sus módulos y lecciones.')) {
      setIsDeleting(true)
      await softDeleteCourseAction(course.id)
    }
  }

  return (
    <details className="bg-surface-container shadow-xl shadow-black/20 rounded-3xl overflow-hidden group mb-6 transition-all duration-300" open>
      <summary className="px-6 sm:px-8 py-5 flex items-center justify-between cursor-pointer hover:bg-surface-container-highest/80 transition-colors list-none">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-on-surface-variant group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-on-surface font-bold text-lg tracking-wide leading-tight">{course.title}</h2>
            <p className="text-on-surface-variant text-xs font-medium tracking-wide mt-1 uppercase">
              {course.modules?.length || 0} módulos <span className="mx-1 text-white/10">•</span>
              {course.is_published ? ' ✓ Publicado' : ' Borrador'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
            className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/20 rounded-xl transition-all hover:scale-105 active:scale-95" title="Editar">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button onClick={handleDelete}
            className="p-2.5 text-on-surface-variant hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all hover:scale-105 active:scale-95" title="Eliminar">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </summary>
      
      <div className="px-5 sm:px-8 py-6 bg-surface-container-lowest/50 shadow-inner space-y-4">
        {children}
      </div>
    </details>
  )
}

export function ModuleItem({ module, children }: { module: any, children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (isEditing) {
    return (
      <div className="mb-4 bg-surface-container-highest rounded-2xl p-5 shadow-lg shadow-primary/10 ring-1 ring-inset ring-primary/30 transition-all">
        <ModuleForm courseId={module.course_id} nextOrder={module.order_index} initialData={module} onCancel={() => setIsEditing(false)} />
      </div>
    )
  }

  if (isDeleting) {
    return (
      <div className="bg-surface-container-low rounded-2xl px-5 py-4 mb-4 opacity-50 flex items-center justify-center">
        <span className="text-on-surface-variant text-sm font-medium tracking-wide animate-pulse">Eliminando módulo...</span>
      </div>
    )
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (confirm('¿Estás seguro de eliminar este módulo?')) {
      setIsDeleting(true)
      await softDeleteModuleAction(module.id)
    }
  }

  return (
    <details className="bg-surface-container-low rounded-2xl overflow-hidden group/mod mb-4 shadow-lg shadow-black/10 transition-all duration-300 ring-1 ring-white/5" open>
      <summary className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-highest/60 transition-colors list-none">
        <div className="flex items-center gap-3 min-w-0">
          <svg className="w-4 h-4 text-on-surface-variant shrink-0 group-open/mod:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-on-surface text-base font-bold tracking-wide truncate">{module.title}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-on-surface-variant font-medium text-xs whitespace-nowrap uppercase tracking-widest group-hover/mod:hidden md:group-hover/mod:inline-block">
            {module.lessons?.length || 0} lecciones
          </span>
          <div className="flex gap-1.5 opacity-0 group-hover/mod:opacity-100 transition-opacity">
            <button onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/20 rounded-lg transition-all" title="Editar">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button onClick={handleDelete}
              className="p-1.5 text-on-surface-variant hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all" title="Eliminar">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </summary>
      <ul className="px-5 pb-4 space-y-1">
        {children}
      </ul>
    </details>
  )
}

export function LessonItem({ lesson }: { lesson: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (isEditing) {
    return (
      <li className="my-3">
        <div className="bg-surface-container-highest ring-1 ring-inset ring-primary/30 rounded-xl overflow-hidden shadow-lg p-5 transition-all">
          <LessonForm moduleId={lesson.module_id} nextOrder={lesson.order_index} initialData={lesson} onCancel={() => setIsEditing(false)} />
        </div>
      </li>
    )
  }

  if (isDeleting) {
    return (
      <li className="py-3 px-4 flex items-center justify-center opacity-50 bg-white/5 rounded-xl my-1">
        <span className="text-on-surface-variant font-medium text-sm animate-pulse">Eliminando lección...</span>
      </li>
    )
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar esta lección?')) {
      setIsDeleting(true)
      await softDeleteLessonAction(lesson.id)
    }
  }

  return (
    <li className="py-3 px-4 flex items-center justify-between group/lesson hover:bg-surface-container-highest/60 rounded-xl transition-all my-1 cursor-default">
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-on-surface-variant font-medium text-sm truncate group-hover/lesson:text-on-surface transition-colors" title={lesson.title}>{lesson.title}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-on-surface-variant/40 font-bold text-xs uppercase tracking-widest group-hover/lesson:hidden">L.{lesson.order_index}</span>
        <div className="hidden group-hover/lesson:flex gap-1.5">
          <button onClick={() => setIsEditing(true)}
            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/20 rounded-md transition-all" title="Editar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button onClick={handleDelete}
            className="p-1.5 text-on-surface-variant hover:text-red-400 hover:bg-red-500/20 rounded-md transition-all" title="Eliminar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  )
}
