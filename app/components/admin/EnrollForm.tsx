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
      <button onClick={() => setIsOpen(true)} className="bg-primary hover:bg-primary-variant text-on-primary font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 mt-2 tracking-wide">
        + Matricular en Nuevo Curso
      </button>
    )
  }

  return (
    <div className="bg-surface-container-highest/50 rounded-3xl p-6 mt-6 mb-8 shadow-xl shadow-black/10 ring-1 ring-white/5">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-on-surface font-extrabold text-xl tracking-wide">Nueva Matrícula</h3>
        <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-primary rounded-full hover:bg-primary/20 p-2 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form action={action} className="space-y-6">
        <input type="hidden" name="user_id" value={userId} />
        
        <div>
          <label className="block text-on-surface-variant font-bold uppercase tracking-widest text-xs mb-2">Seleccionar Curso</label>
          <select name="course_id" required
            className="w-full bg-surface-container-lowest text-on-surface ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-primary shadow-inner rounded-xl px-4 py-3 outline-none transition-all text-sm appearance-none cursor-pointer">
            <option value="">-- Elige un curso --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-on-surface-variant font-bold uppercase tracking-widest text-xs mb-2">Drip Interval (Días)</label>
            <input name="drip_interval_days" type="number" min="0" defaultValue="0"
              className="w-full bg-surface-container-lowest text-on-surface ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-primary shadow-inner rounded-xl px-4 py-3 outline-none transition-all text-sm" />
            <p className="text-[10px] text-on-surface-variant/50 mt-2 uppercase tracking-widest">Días entre lecciones (0 = todo abierto)</p>
          </div>
          <div>
            <label className="block text-on-surface-variant font-bold uppercase tracking-widest text-xs mb-2">Fecha expiración (opcional)</label>
            <input name="expires_at" type="date"
              className="w-full bg-surface-container-lowest text-on-surface ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-primary shadow-inner rounded-xl px-4 py-3 outline-none transition-all text-sm" />
          </div>
        </div>

        {state?.error && <p className="text-red-400 text-[10px] mt-1 truncate" title={state.error}>{state.error}</p>}
        
        <button type="submit" disabled={pending}
          className="w-full bg-primary hover:bg-primary-variant text-on-primary font-black uppercase tracking-widest py-3 mt-4 shadow-xl shadow-primary/20 rounded-xl transition-all disabled:opacity-50">
          {pending ? 'Matriculando...' : 'Confirmar Matrícula'}
        </button>
      </form>
    </div>
  )
}
