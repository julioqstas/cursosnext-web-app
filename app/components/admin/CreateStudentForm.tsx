'use client'

import { useActionState } from 'react'
import { createStudentAction } from '@/app/actions/auth'

export default function CreateStudentForm() {
  const [state, action, pending] = useActionState(createStudentAction, null)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="cs-full-name" className="block text-xs font-medium text-gray-400 mb-1">Nombre completo</label>
        <input id="cs-full-name" name="full_name" type="text" required placeholder="Juan Pérez"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm
                     placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
      </div>
      <div>
        <label htmlFor="cs-dni" className="block text-xs font-medium text-gray-400 mb-1">DNI (8 dígitos)</label>
        <input id="cs-dni" name="dni" type="text" inputMode="numeric" maxLength={8} required placeholder="12345678"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm
                     placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition tracking-widest" />
      </div>
      <div>
        <label htmlFor="cs-password" className="block text-xs font-medium text-gray-400 mb-1">Contraseña temporal</label>
        <input id="cs-password" name="password" type="password" required placeholder="••••••"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm
                     placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
      </div>

      {state?.error && (
        <p className="text-red-400 text-xs bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-emerald-400 text-xs bg-emerald-900/30 border border-emerald-700/50 rounded-lg px-3 py-2">{state.success}</p>
      )}

      <button type="submit" disabled={pending}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm
                   font-semibold rounded-xl py-2.5 transition-colors duration-200">
        {pending ? 'Creando...' : 'Crear alumno'}
      </button>
    </form>
  )
}
