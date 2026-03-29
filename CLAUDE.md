@AGENTS.md

# ISIMOVA Academia — Guía de Desarrollo

## Propósito del Proyecto

LMS (Learning Management System) para ISIMOVA Academia. Permite entregar cursos en línea con sistema de goteo (*drip-feed*): las lecciones se desbloquean de forma progresiva según la fecha de inscripción del alumno. El admin controla el currículo, los alumnos y puede desbloquear lecciones manualmente.

## Tech Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript 5**
- **Tailwind CSS 4** — tema dark con acento naranja (`#f97316`)
- **Supabase** (PostgreSQL + Auth) — `@supabase/ssr` para SSR, `@supabase/supabase-js` para el admin
- **Server Actions** de Next.js para todas las mutaciones
- **React Quill** (`react-quill-new`) para el editor de contenido de lecciones
- Path alias: `@/*` → `src/` raíz del proyecto

## Estructura de Directorios

```
app/
  layout.tsx              # Root layout, Inter font, lang="es"
  page.tsx                # Redirección según rol (admin → /admin/dashboard, student → /dashboard)
  globals.css             # Tailwind + tema de colores personalizados
  login/page.tsx          # Login con DNI + partículas animadas
  dashboard/page.tsx      # Home del alumno: cursos inscritos con barra de progreso
  cursos/[courseId]/
    page.tsx              # Redirige a la primera lección del curso
    leccion/[lessonId]/page.tsx  # Visor de lección: video YouTube + contenido + acordeón
  admin/
    dashboard/page.tsx    # Métricas generales del admin
    cursos/page.tsx       # CRUD de cursos, módulos y lecciones
    alumnos/page.tsx      # Gestión de alumnos e inscripciones
  actions/
    auth.ts               # login (DNI→email), logout, crear/activar/desactivar alumnos
    courses.ts            # CRUD de cursos, módulos, lecciones
    enrollments.ts        # Crear/pausar/activar/suspender inscripciones; overrides
    progress.ts           # Marcar lección como completada
  components/
    YouTubePlayer.tsx
    LessonAccordion.tsx   # Sidebar con estructura del curso y estados (bloqueado/completado)
    ParticlesBackground.tsx
    admin/                # Formularios: CourseForm, ModuleForm, LessonForm, EnrollForm,
                          # LessonOverrideForm, CreateStudentForm, EnrollmentActions,
                          # CurriculumItems, RichTextEditor
lib/
  database.types.ts       # Tipos generados de Supabase — fuente de verdad de tipos
  drip.ts                 # Lógica de goteo: isLessonUnlocked(), getCourseProgress()
  supabase/
    server.ts             # createClient() (SSR con cookies) y createAdminClient() (service role)
    client.ts             # Cliente browser con tipos
    middleware.ts         # Refresca sesión en cada request
```

## Modelo de Datos

```
profiles        id, dni, full_name, role ('admin'|'student'), is_active
courses         id, title, description, image_url, is_published, is_active,
                instructor_name, instructor_bio, instructor_avatar_url
modules         id, course_id, title, order_index, is_active
lessons         id, module_id, title, youtube_id, content_md (HTML), order_index, is_active
enrollments     id, user_id, course_id, enrolled_at, expires_at, status ('active'|'paused'|'suspended'),
                drip_interval_days
lesson_overrides  id, enrollment_id, lesson_id, manual_unlock_date
progress        id, user_id, lesson_id, is_completed, completed_at
```

**Tipos de conveniencia** en `lib/database.types.ts`:
`Profile`, `Course`, `Module`, `Lesson`, `Enrollment`, `LessonOverride`, `Progress`

## Lógica de Goteo (`lib/drip.ts`)

`isLessonUnlocked(lesson, enrollment, overrides, allLessons, completedIds, now)`:

1. Si existe `lesson_override` → usar `manual_unlock_date`
2. Si la lección ya fue completada → siempre accesible
3. Si `enrollment.status === 'paused'` → bloqueada
4. Si `drip_interval_days === 0` → acceso libre
5. `unlock_date = enrolled_at + (globalOrderIndex × drip_interval_days × 86400000ms)`

El `globalOrderIndex` es la posición 0-based de la lección al ordenar **todos** los módulos del curso por `module.order_index`, luego `lesson.order_index`.

## Autenticación

- Login con **DNI de 8 dígitos** + contraseña
- El DNI se convierte en email: `{dni}@alumnos.isimova.com`
- Supabase Auth maneja la sesión vía cookies HTTP-only
- Roles en `profiles.role`: `'admin'` o `'student'`
- `createClient()` usa la anon key (SSR) — para lecturas con contexto de usuario
- `createAdminClient()` usa `SUPABASE_SERVICE_ROLE_KEY` — **solo en Server Actions / Route Handlers**

## Convenciones de Código

- **Soft deletes**: nunca eliminar registros, marcar `is_active = false`
- **Mutaciones**: siempre via Server Actions (`app/actions/`); llamar `revalidatePath()` al final
- **Errores**: las actions retornan `{ error: string }` o `{ success: true }` — no lanzan excepciones al cliente
- **UI en español**: todos los labels, mensajes de error y placeholders en español
- **Tema**: dark surface `#0c1324`, primary naranja `#f97316`, glassmorphism en cards
- **TypeScript estricto**: importar tipos desde `@/lib/database.types` siempre

## Variables de Entorno Requeridas

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Notas Importantes

- **`content_md`** almacena HTML (editado con Quill), no Markdown — el nombre es histórico
- Los cursos con `is_published = false` no son visibles para alumnos
- El orden de lecciones para el goteo es **global por curso**, no por módulo
- Un alumno con `status = 'suspended'` no puede acceder al curso (tratar igual que inactivo)
- `expires_at` en enrollments es opcional; si es `null` el acceso no vence
