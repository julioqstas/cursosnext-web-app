'use client'

import { useActionState, useState, useEffect } from 'react'
import { upsertModuleAction } from '@/app/actions/courses'

export default function ModuleForm({ courseId, nextOrder, initialData, onCancel }: { courseId: string; nextOrder: number; initialData?: any; onCancel?: () => void }) {
  const [state, action, pending] = useActionState(upsertModuleAction, null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false)
      if (onCancel) onCancel() // Close edit mode if successful
    }
  }, [state?.success, onCancel])

  if (!isOpen && !initialData) {
    return (
      <button onClick={() => setIsOpen(true)} className="text-violet-400 hover:text-violet-300 text-sm py-3 px-6 w-full text-left transition-colors border-t border-gray-800 font-medium">
        + Añadir módulo
      </button>
    )
  }

  return (
    <form action={action} className="p-6 bg-gray-800/30 border-t border-gray-800 space-y-3">
      {initialData && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="order_index" value={initialData?.order_index ?? nextOrder} />
      
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Título del nuevo módulo</label>
        <input name="title" type="text" required placeholder="Ej: Introducción" defaultValue={initialData?.title}
          className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm
                     placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition" />
      </div>

      {state?.error && <p className="text-red-400 text-xs bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">{state.error}</p>}
      
      <div className="flex items-center gap-2 pt-2">
        <button type="submit" disabled={pending}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl px-4 py-2 transition-colors">
          {pending ? 'Guardando...' : (initialData ? 'Actualizar módulo' : 'Guardar módulo')}
        </button>
        <button type="button" onClick={() => { setIsOpen(false); if(onCancel) onCancel(); }}
          className="text-gray-400 hover:text-white text-sm transition-colors px-3 py-2">
          Cancelar
        </button>
      </div>
    </form>
  )
}
