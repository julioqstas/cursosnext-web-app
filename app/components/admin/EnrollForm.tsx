'use client'

import { useActionState, useState, useEffect } from 'react'
import { enrollStudentAction } from '@/app/actions/enrollments'

export default function EnrollForm({ userId, courses }: { userId: string, courses: { id: string, title: string }[] }) {
  const [state, action, pending] = useActionState(enrollStudentAction, null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false)
    }
  }, [state?.success])

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-600/30 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
        + Matricular en curso
      </button>
    )
  }

  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-5 mt-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-medium">Nueva Matrícula</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="user_id" value={userId} />
        
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Seleccionar Curso</label>
          <select name="course_id" required
            className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:border-indigo-500 transition appearance-none">
            <option value="">-- Elige un curso --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Drip Interval (Días)</label>
            <input name="drip_interval_days" type="number" min="0" defaultValue="0"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:border-indigo-500 transition" />
            <p className="text-[10px] text-gray-500 mt-1">Días entre lecciones (0 = todo abierto)</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Fecha expiración (opcional)</label>
            <input name="expires_at" type="date"
              className="w-full bg-gray-900 border border-gray-700 text-gray-300 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:border-indigo-500 transition" />
          </div>
        </div>

        {state?.error && <p className="text-red-400 text-xs bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">{state.error}</p>}
        
        <button type="submit" disabled={pending}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2.5 transition-colors">
          {pending ? 'Matriculando...' : 'Confirmar Matrícula'}
        </button>
      </form>
    </div>
  )
}
