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

  const pauseAction = async () => {
    startTransition(async () => {
      await pauseEnrollmentAction(enrollmentId, userId)
    })
  }

  const activateAction = async () => {
    startTransition(async () => {
      await activateEnrollmentAction(enrollmentId, userId)
    })
  }

  const suspendAction = async () => {
    startTransition(async () => {
      await suspendEnrollmentAction(enrollmentId, userId)
    })
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${
        status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
        status === 'paused' ? 'bg-yellow-500/10 text-yellow-500' :
        'bg-red-500/10 text-red-500'
      }`}>
        {status === 'active' ? 'Activa' : status === 'paused' ? 'Pausada' : 'Suspendida'}
      </span>

      {status === 'active' && (
        <form action={pauseAction}>
          <button type="submit" disabled={isPending}
            className="text-xs font-bold uppercase tracking-widest bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {isPending ? 'Pausando...' : 'Pausar'}
          </button>
        </form>
      )}

      {(status === 'paused' || status === 'suspended') && (
        <form action={activateAction}>
          <button type="submit" disabled={isPending}
            className="text-xs font-bold uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {isPending ? 'Activando...' : 'Activar'}
          </button>
        </form>
      )}

      {status !== 'suspended' && (
        <button onClick={() => {
            if (confirm('Se denegará el acceso al curso indefinidamente. ¿Continuar?')) {
              suspendAction()
            }
          }}
          className="text-xs font-bold uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg transition-colors">
          Suspender
        </button>
      )}
    </div>
  )
}
