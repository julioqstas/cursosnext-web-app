'use client'

import { useActionState } from 'react'
import { upsertCourseAction } from '@/app/actions/courses'

export default function CourseForm({ initialData, onCancel }: { initialData?: any; onCancel?: () => void }) {
  const [state, action, pending] = useActionState(upsertCourseAction, null)

  return (
    <form action={action} className="space-y-4">
      {initialData && <input type="hidden" name="id" value={initialData.id} />}
      <div>
        <label htmlFor="cf-title" className="block text-xs font-medium text-gray-400 mb-1">Título del curso</label>
        <input id="cf-title" name="title" type="text" required placeholder="Nombre del curso" defaultValue={initialData?.title}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm
                     placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
      </div>
      <div>
        <label htmlFor="cf-desc" className="block text-xs font-medium text-gray-400 mb-1">Descripción</label>
        <textarea id="cf-desc" name="description" rows={3} placeholder="Descripción del curso..." defaultValue={initialData?.description}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm
                     placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none" />
      </div>
      <div>
        <label htmlFor="cf-image" className="block text-xs font-medium text-gray-400 mb-1">URL de imagen (portada)</label>
        <input id="cf-image" name="image_url" type="url" placeholder="https://..." defaultValue={initialData?.image_url}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm
                     placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-instructor-name" className="block text-xs font-medium text-gray-400 mb-1">Nombre del docente</label>
          <input id="cf-instructor-name" name="instructor_name" type="text" placeholder="Ej. Dra. Ana Pérez" defaultValue={initialData?.instructor_name}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm
                       placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
        </div>
        <div>
          <label htmlFor="cf-instructor-avatar" className="block text-xs font-medium text-gray-400 mb-1">URL de la imagen del docente</label>
          <input id="cf-instructor-avatar" name="instructor_avatar_url" type="url" placeholder="https://..." defaultValue={initialData?.instructor_avatar_url}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm
                       placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
        </div>
      </div>
      <div>
        <label htmlFor="cf-instructor-bio" className="block text-xs font-medium text-gray-400 mb-1">Texto de presentación</label>
        <textarea id="cf-instructor-bio" name="instructor_bio" rows={2} placeholder="Especialidad y reseña..." defaultValue={initialData?.instructor_bio}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm
                     placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none" />
      </div>
      <div className="flex items-center gap-2">
        <input id="cf-published" name="is_published" type="checkbox" value="true" defaultChecked={initialData?.is_published}
          className="w-4 h-4 rounded accent-indigo-500" />
        <label htmlFor="cf-published" className="text-sm text-gray-300">Publicar inmediatamente</label>
      </div>

      {state?.error && (
        <p className="text-red-400 text-xs bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-emerald-400 text-xs bg-emerald-900/30 border border-emerald-700/50 rounded-lg px-3 py-2">{state.success}</p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={pending}
          className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm
                     font-semibold rounded-xl py-2.5 transition-colors duration-200">
          {pending ? 'Guardando...' : (initialData ? 'Actualizar curso' : 'Crear curso')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors duration-200">
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
