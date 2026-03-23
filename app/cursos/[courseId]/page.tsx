import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// /cursos/[courseId] → redirect to first available lesson
interface PageProps {
  params: Promise<{ courseId: string }>
}

export default async function CoursePage({ params }: PageProps) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Get ALL active modules for the course, sorted
  const { data: modules } = await admin
    .from('modules')
    .select('id, order_index')
    .eq('course_id', courseId)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (!modules || modules.length === 0) redirect('/dashboard')

  // Get ALL active lessons for these modules
  const moduleIds = modules.map((m: any) => m.id)
  const { data: lessons } = await admin
    .from('lessons')
    .select('id, module_id, order_index')
    .in('module_id', moduleIds)
    .eq('is_active', true)

  if (!lessons || lessons.length === 0) redirect('/dashboard')

  // Sort lessons to find the absolutely first one (lowest module order, then lowest lesson order)
  const moduleOrderMap = Object.fromEntries(modules.map((m: any) => [m.id, m.order_index]))
  const sortedLessons = lessons.sort((a: any, b: any) => {
    if (moduleOrderMap[a.module_id] !== moduleOrderMap[b.module_id]) {
      return moduleOrderMap[a.module_id] - moduleOrderMap[b.module_id]
    }
    return a.order_index - b.order_index
  })

  // Redirect to the first valid lesson
  redirect(`/cursos/${courseId}/leccion/${sortedLessons[0].id}`)
}
