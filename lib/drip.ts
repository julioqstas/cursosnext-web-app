import type { Enrollment, Lesson, LessonOverride, Progress } from '@/lib/database.types'

/**
 * Extended lesson type with its module's order_index attached,
 * needed to compute global order across all modules.
 */
export interface LessonWithModule extends Lesson {
  moduleOrderIndex: number
}

/**
 * Determines if a lesson is unlocked for a given enrollment.
 *
 * Priority:
 * 1. If a lesson_override exists → use manual_unlock_date.
 * 2. If enrollment is 'paused' and lesson is not completed → locked.
 * 3. If drip_interval_days === 0 → free access (unlocked).
 * 4. Otherwise: unlock_date = enrolled_at + (drip_interval_days * globalOrderIndex)
 *
 * The globalOrderIndex is the 0-based position of the lesson across ALL modules
 * of the course, sorted by module.order_index then lesson.order_index.
 */
export function isLessonUnlocked(
  lesson: LessonWithModule,
  enrollment: Enrollment,
  overrides: LessonOverride[],
  allLessons: LessonWithModule[],
  completedLessonIds: Set<string>,
  now: Date = new Date()
): boolean {
  // 1. Check for a manual override
  const override = overrides.find((o) => o.lesson_id === lesson.id)
  if (override) {
    return new Date(override.manual_unlock_date) <= now
  }

  // 2. If completed, always show as accessible (progress preserved)
  if (completedLessonIds.has(lesson.id)) return true

  // 3. Paused enrollment → block all non-completed lessons
  if (enrollment.status === 'paused') return false

  // 4. Free access (drip disabled)
  if (enrollment.drip_interval_days === 0) return true

  // 5. Compute global order index (0-based)
  const sorted = [...allLessons].sort((a, b) => {
    if (a.moduleOrderIndex !== b.moduleOrderIndex) {
      return a.moduleOrderIndex - b.moduleOrderIndex
    }
    return a.order_index - b.order_index
  })
  const globalIndex = sorted.findIndex((l) => l.id === lesson.id)
  if (globalIndex === -1) return false

  const enrolledAt = new Date(enrollment.enrolled_at)
  const unlockDate = new Date(
    enrolledAt.getTime() +
      globalIndex * enrollment.drip_interval_days * 24 * 60 * 60 * 1000
  )

  return unlockDate <= now
}

/**
 * Returns the progress percentage (0–100) for a set of lessons.
 */
export function getCourseProgress(
  lessons: Lesson[],
  completedLessonIds: Set<string>
): number {
  if (lessons.length === 0) return 0
  const completed = lessons.filter((l) => completedLessonIds.has(l.id)).length
  return Math.round((completed / lessons.length) * 100)
}
