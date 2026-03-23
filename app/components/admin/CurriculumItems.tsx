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
      <div className="bg-gray-900 border border-indigo-500/50 rounded-2xl p-6 mb-4 shadow-lg shadow-indigo-500/10">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Editar curso
        </h2>
        <CourseForm initialData={course} onCancel={() => setIsEditing(false)} />
      </div>
    )
  }

  if (isDeleting) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4 opacity-50 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Eliminando curso...</span>
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
    <details className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden group mb-4" open>
      <summary className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/40 transition-colors list-none">
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div>
            <h2 className="text-white font-medium leading-tight">{course.title}</h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {course.modules?.length || 0} módulos ·
              {course.is_published ? ' ✓ Publicado' : ' Borrador'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
            className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Editar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </summary>
      
      <div className="border-t border-gray-800 px-6 py-4 space-y-3">
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
      <div className="mb-3 border border-violet-500/50 rounded-xl overflow-hidden shadow-lg shadow-violet-500/10">
        <ModuleForm courseId={module.course_id} nextOrder={module.order_index} initialData={module} onCancel={() => setIsEditing(false)} />
      </div>
    )
  }

  if (isDeleting) {
    return (
      <div className="bg-gray-800/40 rounded-xl px-4 py-3 mb-3 opacity-50 flex items-center justify-center">
        <span className="text-gray-400 text-xs">Eliminando módulo...</span>
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
    <details className="bg-gray-800/40 rounded-xl overflow-hidden group/mod mb-3" open>
      <summary className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-700/40 transition-colors list-none">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-200 text-sm font-medium truncate">{module.title}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-xs whitespace-nowrap group-hover/mod:hidden md:group-hover/mod:inline-block">
            {module.lessons?.length || 0} lecciones
          </span>
          <div className="flex gap-1 opacity-0 group-hover/mod:opacity-100 transition-opacity">
            <button onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
              className="p-1.5 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-md transition-colors" title="Editar">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors" title="Eliminar">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </summary>
      <ul className="divide-y divide-gray-700/50 px-4">
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
      <li className="py-2 border-l-2 border-indigo-500 pl-4 my-2">
        <div className="border border-indigo-500/30 rounded-lg overflow-hidden shadow-lg shadow-indigo-500/10">
          <LessonForm moduleId={lesson.module_id} nextOrder={lesson.order_index} initialData={lesson} onCancel={() => setIsEditing(false)} />
        </div>
      </li>
    )
  }

  if (isDeleting) {
    return (
      <li className="py-2.5 flex items-center justify-center opacity-50">
        <span className="text-gray-500 text-xs">Eliminando lección...</span>
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
    <li className="py-2.5 flex items-center justify-between group/lesson">
      <div className="flex items-center gap-2 min-w-0 pr-4">
        <svg className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-gray-300 text-sm truncate" title={lesson.title}>{lesson.title}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-gray-600 text-xs group-hover/lesson:hidden">#{lesson.order_index}</span>
        <div className="hidden group-hover/lesson:flex gap-1">
          <button onClick={() => setIsEditing(true)}
            className="p-1 text-gray-500 hover:text-indigo-400 transition-colors" title="Editar">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button onClick={handleDelete}
            className="p-1 text-gray-500 hover:text-red-400 transition-colors" title="Eliminar">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  )
}
