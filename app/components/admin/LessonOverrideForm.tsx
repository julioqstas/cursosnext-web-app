'use client'

import { useActionState } from 'react'
import { upsertLessonOverrideAction } from '@/app/actions/enrollments'
import type { LessonOverride } from '@/lib/database.types'
import { useFormStatus } from 'react-dom'

interface Props {
  enrollmentId: string
  lessonId: string
  userId: string
  currentOverride: LessonOverride | null
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs font-bold uppercase tracking-widest bg-primary/20 hover:bg-primary text-primary hover:text-on-primary rounded-lg px-4 py-2 transition-all disabled:opacity-50"
    >
      {pending ? '...' : 'Fijar'}
    </button>
  )
}

export default function LessonOverrideForm({ enrollmentId, lessonId, userId, currentOverride }: Props) {
  const [state, action] = useActionState(upsertLessonOverrideAction, null)

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="enrollment_id" value={enrollmentId} />
      <input type="hidden" name="lesson_id" value={lessonId} />
      <input type="hidden" name="user_id" value={userId} />
      <div className="flex-1 min-w-[130px]">
        <input
          type="date"
          name="manual_unlock_date"
          defaultValue={currentOverride ? new Date(currentOverride.manual_unlock_date).toISOString().split('T')[0] : ''}
          required
          className="w-full bg-surface-container-low text-on-surface text-xs rounded-lg px-3 py-2 ring-1 ring-inset ring-white/10 outline-none focus:ring-primary shadow-inner transition-all"
        />
      </div>
      <SubmitButton />
      {state?.error && <p className="text-red-400 text-[10px] mt-1 truncate max-w-[100px]" title={state.error}>{state.error}</p>}
    </form>
  )
}
