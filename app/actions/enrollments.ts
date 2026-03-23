'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any

/** Enroll a student in a course */
export async function enrollStudentAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const user_id = formData.get('user_id') as string
  const course_id = formData.get('course_id') as string
  const drip_interval_days = parseInt(formData.get('drip_interval_days') as string) || 0
  const expires_at = formData.get('expires_at') as string | null

  const admin = createAdminClient()
  const { error } = await (admin.from('enrollments') as AnyTable).insert({
    user_id,
    course_id,
    drip_interval_days,
    expires_at: expires_at || null,
    status: 'active',
  })

  if (error) return { error: error.message }
  revalidatePath(`/admin/alumnos/${user_id}`)
  return { success: 'Matrícula creada.' }
}

/** Admin: pause a student's enrollment */
export async function pauseEnrollmentAction(enrollmentId: string, userId: string) {
  const admin = createAdminClient()
  await (admin.from('enrollments') as AnyTable)
    .update({ status: 'paused' })
    .eq('id', enrollmentId)
  revalidatePath(`/admin/alumnos/${userId}`)
}

/** Admin: activate (unpause) an enrollment */
export async function activateEnrollmentAction(enrollmentId: string, userId: string) {
  const admin = createAdminClient()
  await (admin.from('enrollments') as AnyTable)
    .update({ status: 'active' })
    .eq('id', enrollmentId)
  revalidatePath(`/admin/alumnos/${userId}`)
}

/** Admin: suspend an enrollment */
export async function suspendEnrollmentAction(enrollmentId: string, userId: string) {
  const admin = createAdminClient()
  await (admin.from('enrollments') as AnyTable)
    .update({ status: 'suspended' })
    .eq('id', enrollmentId)
  revalidatePath(`/admin/alumnos/${userId}`)
}

/** Admin: upsert a lesson override (set manual unlock date) */
export async function upsertLessonOverrideAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const enrollment_id = formData.get('enrollment_id') as string
  const lesson_id = formData.get('lesson_id') as string
  const manual_unlock_date = formData.get('manual_unlock_date') as string
  const userId = formData.get('user_id') as string

  const admin = createAdminClient()

  if (!manual_unlock_date) {
    const { error } = await (admin.from('lesson_overrides') as AnyTable)
      .delete()
      .eq('enrollment_id', enrollment_id)
      .eq('lesson_id', lesson_id)
    
    if (error) return { error: error.message }
    revalidatePath(`/admin/alumnos/${userId}`)
    return { success: 'Restricción eliminada.' }
  }

  const { error } = await (admin.from('lesson_overrides') as AnyTable)
    .upsert(
      { enrollment_id, lesson_id, manual_unlock_date },
      { onConflict: 'enrollment_id,lesson_id' }
    )

  if (error) return { error: error.message }
  revalidatePath(`/admin/alumnos/${userId}`)
  return { success: 'Override guardado.' }
}

/** Admin: delete a lesson override */
export async function deleteLessonOverrideAction(
  overrideId: string,
  userId: string
) {
  const admin = createAdminClient()
  await admin.from('lesson_overrides').delete().eq('id', overrideId)
  revalidatePath(`/admin/alumnos/${userId}`)
}
