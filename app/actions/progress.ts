'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any

/** Mark a lesson as completed for the current user */
export async function markLessonCompleteAction(lessonId: string, courseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await (supabase.from('progress') as AnyTable).upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      is_completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' }
  )

  revalidatePath(`/cursos/${courseId}`)
}
