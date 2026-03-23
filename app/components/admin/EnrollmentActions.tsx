'use client'

import { useTransition } from 'react'
import {
  pauseEnrollmentAction,
  activateEnrollmentAction,
  suspendEnrollmentAction,
} from '@/app/actions/enrollments'

interface EnrollmentActionsProps {
  enrollmentId: string
  userId: string
  status: 'active' | 'paused' | 'suspended'
}

export default function EnrollmentActions({ enrollmentId, userId, status }: EnrollmentActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handle = (fn: () => Promise<void>) => {
    startTransition(async () => { await fn() })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
        status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        : status === 'paused' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        : 'bg-red-500/20 text-red-400 border-red-500/30'
      }`}>
        {status === 'active' ? 'Activa' : status === 'paused' ? 'Pausada' : 'Suspendida'}
      </span>

      {status === 'active' && (
        <button
          disabled={isPending}
          onClick={() => handle(() => pauseEnrollmentAction(enrollmentId, userId))}
          className="text-xs bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 border border-yellow-600/30
                     rounded-lg px-3 py-1 transition-colors disabled:opacity-50"
        >
          Pausar
        </button>
      )}

      {status === 'paused' && (
        <button
          disabled={isPending}
          onClick={() => handle(() => activateEnrollmentAction(enrollmentId, userId))}
          className="text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30
                     rounded-lg px-3 py-1 transition-colors disabled:opacity-50"
        >
          Activar
        </button>
      )}

      {status !== 'suspended' && (
        <button
          disabled={isPending}
          onClick={() => {
            if (confirm('¿Suspender esta matrícula? El alumno no podrá acceder al curso.')) {
              handle(() => suspendEnrollmentAction(enrollmentId, userId))
            }
          }}
          className="text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30
                     rounded-lg px-3 py-1 transition-colors disabled:opacity-50"
        >
          Suspender
        </button>
      )}
    </div>
  )
}
