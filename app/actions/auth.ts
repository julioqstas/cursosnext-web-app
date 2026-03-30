'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient, requireAdmin } from '@/lib/supabase/server'

/** Login with DNI — transforms DNI to email silently */
export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const dni = (formData.get('dni') as string)?.trim()
  const password = formData.get('password') as string

  if (!/^\d{8}$/.test(dni)) {
    return { error: 'El DNI debe tener exactamente 8 dígitos.' }
  }

  const email = `${dni}@alumnos.isimova.com`
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: 'DNI o contraseña incorrectos.' }
  }

  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin') {
      redirect('/admin/dashboard')
    }
  }

  redirect('/dashboard')
}

/** Logout */
export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

/** Admin: create a new student (auth + profile) */
export async function createStudentAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const dni = (formData.get('dni') as string)?.trim()
  const full_name = (formData.get('full_name') as string)?.trim()
  const password = formData.get('password') as string

  if (!/^\d{8}$/.test(dni)) return { error: 'DNI inválido (8 dígitos).' }
  if (!full_name) return { error: 'Nombre completo requerido.' }
  if (!password || password.length < 6) return { error: 'Contraseña mínimo 6 caracteres.' }

  await requireAdmin()

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email: `${dni}@alumnos.isimova.com`,
    password,
    email_confirm: true,
    user_metadata: { dni, full_name, role: 'student' },
  })

  if (error) return { error: error.message }

  // Profile is created by the DB trigger — but update full_name/dni just in case
  await admin.from('profiles').upsert({
    id: data.user.id,
    dni,
    full_name,
    role: 'student',
    is_active: true,
  })

  revalidatePath('/admin/alumnos')
  return { success: `Alumno ${full_name} creado exitosamente.` }
}

/** Admin: soft-delete a student */
export async function deactivateStudentAction(userId: string) {
  await requireAdmin()
  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('profiles') as any).update({ is_active: false }).eq('id', userId)
  revalidatePath('/admin/alumnos')
}

/** Admin: reactivate a student */
export async function activateStudentAction(userId: string) {
  await requireAdmin()
  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('profiles') as any).update({ is_active: true }).eq('id', userId)
  revalidatePath('/admin/alumnos')
}
