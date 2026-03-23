'use client'

import { useActionState } from 'react'
import { upsertLessonOverrideAction } from '@/app/actions/enrollments'
import type { LessonOverride } from '@/lib/database.types'

interface LessonOverrideFormProps {
  enrollmentId: string
  lessonId: string
  userId: string
  currentOverride: LessonOverride | null
}

export default function LessonOverrideForm({
  enrollmentId,
  lessonId,
  userId,
  currentOverride,
}: LessonOverrideFormProps) {
  const [state, action, pending] = useActionState(upsertLessonOverrideAction, null)

  // Format date for input[type=datetime-local]
  const defaultDate = currentOverride
    ? new Date(currentOverride.manual_unlock_date).toISOString().slice(0, 16)
    : ''

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="enrollment_id" value={enrollmentId} />
      <input type="hidden" name="lesson_id" value={lessonId} />
      <input type="hidden" name="user_id" value={userId} />
      <input
        type="datetime-local"
        name="manual_unlock_date"
        defaultValue={defaultDate}
        className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5
                   focus:outline-none focus:border-indigo-500 transition"
      />
      <button
        type="submit"
        disabled={pending}
        className="text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400
                   border border-indigo-600/30 rounded-lg px-2 py-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {currentOverride ? 'Actualizar' : 'Fijar'}
      </button>
    </form>
  )
}
