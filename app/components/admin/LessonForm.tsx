'use client'

import { useActionState, useState, useEffect } from 'react'
import { upsertLessonAction } from '@/app/actions/courses'

export default function LessonForm({ moduleId, nextOrder, initialData, onCancel }: { moduleId: string; nextOrder: number; initialData?: any; onCancel?: () => void }) {
  const [state, action, pending] = useActionState(upsertLessonAction, null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false)
      if (onCancel) onCancel()
    }
  }, [state?.success, onCancel])

  if (!isOpen && !initialData) {
    return (
      <div className="px-4 py-2 border-t border-gray-700/50">
        <button onClick={() => setIsOpen(true)} className="text-indigo-400 hover:text-indigo-300 text-xs py-1.5 px-3 rounded-lg hover:bg-indigo-500/10 transition-colors flex items-center gap-1.5 font-medium">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir lección
        </button>
      </div>
    )
  }

  return (
    <form action={action} className="p-4 bg-gray-900/50 border-t border-gray-700/50 space-y-3">
      {initialData && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="module_id" value={moduleId} />
      <input type="hidden" name="order_index" value={initialData?.order_index ?? nextOrder} />
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Título de la lección</label>
          <input name="title" type="text" required placeholder="Ej: Fundamentos básicos" defaultValue={initialData?.title}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs
                       placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Video en YouTube (ID)</label>
          <input name="youtube_id" type="text" placeholder="Ej: dQw4w9WgXcQ" defaultValue={initialData?.youtube_id}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs
                       placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
          <p className="text-[10px] text-gray-600 mt-1">Solo los 11 caracteres del ID. Ej: https://youtube.com/watch?v=<strong className="text-gray-400">dQw4w9WgXcQ</strong></p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Contenido Markdown</label>
          <textarea name="content_md" rows={4} placeholder="# Apuntes de la lección..." defaultValue={initialData?.content_md}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs font-mono
                       placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-y" />
        </div>
      </div>

      {state?.error && <p className="text-red-400 text-xs bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">{state.error}</p>}
      
      <div className="flex items-center gap-2 pt-1">
        <button type="submit" disabled={pending}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg px-4 py-2 transition-colors">
          {pending ? 'Guardando...' : (initialData ? 'Actualizar lección' : 'Guardar lección')}
        </button>
        <button type="button" onClick={() => { setIsOpen(false); if(onCancel) onCancel(); }}
          className="text-gray-400 hover:text-white text-xs transition-colors px-3 py-2">
          Cancelar
        </button>
      </div>
    </form>
  )
}
