'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any

export async function upsertCourseAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const id = formData.get('id') as string | null
  const title = (formData.get('title') as string)?.trim()
  const description = formData.get('description') as string
  const image_url = formData.get('image_url') as string
  const instructor_name = formData.get('instructor_name') as string
  const instructor_bio = formData.get('instructor_bio') as string
  const instructor_avatar_url = formData.get('instructor_avatar_url') as string
  const is_published = formData.get('is_published') === 'true'

  if (!title) return { error: 'Título requerido.' }

  const admin = createAdminClient()
  const { error } = await (admin.from('courses') as AnyTable).upsert(
    { 
      ...(id ? { id } : {}), 
      title, 
      description, 
      image_url, 
      is_published,
      instructor_name,
      instructor_bio,
      instructor_avatar_url
    },
    { onConflict: 'id' }
  )

  if (error) return { error: error.message }
  revalidatePath('/admin/cursos')
  return { success: id ? 'Curso actualizado.' : 'Curso creado.' }
}

export async function softDeleteCourseAction(courseId: string) {
  const admin = createAdminClient()
  await (admin.from('courses') as AnyTable).update({ is_active: false }).eq('id', courseId)
  revalidatePath('/admin/cursos')
}

export async function upsertModuleAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const id = formData.get('id') as string | null
  const course_id = formData.get('course_id') as string
  const title = (formData.get('title') as string)?.trim()
  const order_index = parseInt(formData.get('order_index') as string) || 0

  if (!title) return { error: 'Título requerido.' }

  const admin = createAdminClient()
  const { error } = await (admin.from('modules') as AnyTable).upsert(
    { ...(id ? { id } : {}), course_id, title, order_index },
    { onConflict: 'id' }
  )

  if (error) return { error: error.message }
  revalidatePath('/admin/cursos')
  return { success: id ? 'Módulo actualizado.' : 'Módulo creado.' }
}

export async function softDeleteModuleAction(moduleId: string) {
  const admin = createAdminClient()
  await (admin.from('modules') as AnyTable).update({ is_active: false }).eq('id', moduleId)
  revalidatePath('/admin/cursos')
}

export async function upsertLessonAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const id = formData.get('id') as string | null
  const module_id = formData.get('module_id') as string
  const title = (formData.get('title') as string)?.trim()
  const youtube_id = formData.get('youtube_id') as string
  const content_md = formData.get('content_md') as string
  const order_index = parseInt(formData.get('order_index') as string) || 0

  if (!title) return { error: 'Título requerido.' }

  const admin = createAdminClient()
  const { error } = await (admin.from('lessons') as AnyTable).upsert(
    { ...(id ? { id } : {}), module_id, title, youtube_id, content_md, order_index },
    { onConflict: 'id' }
  )

  if (error) return { error: error.message }
  revalidatePath('/admin/cursos')
  return { success: id ? 'Lección actualizada.' : 'Lección creada.' }
}

export async function softDeleteLessonAction(lessonId: string) {
  const admin = createAdminClient()
  await (admin.from('lessons') as AnyTable).update({ is_active: false }).eq('id', lessonId)
  revalidatePath('/admin/cursos')
}
