-- ============================================================
-- ISIMOVA Academy — Supabase SQL Schema
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (already available by default on Supabase)
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  dni         text not null unique,
  full_name   text not null,
  role        text not null default 'student' check (role in ('admin', 'student')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, dni, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'dni', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', 'Alumno'),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── COURSES ─────────────────────────────────────────────────
create table if not exists public.courses (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text,
  image_url    text,
  is_published boolean not null default false,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.courses enable row level security;

-- ─── MODULES ─────────────────────────────────────────────────
create table if not exists public.modules (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  order_index integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.modules enable row level security;

-- ─── LESSONS ─────────────────────────────────────────────────
create table if not exists public.lessons (
  id          uuid primary key default uuid_generate_v4(),
  module_id   uuid not null references public.modules(id) on delete cascade,
  title       text not null,
  youtube_id  text,
  content_md  text,
  order_index integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.lessons enable row level security;

-- ─── ENROLLMENTS ─────────────────────────────────────────────
create table if not exists public.enrollments (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  course_id           uuid not null references public.courses(id) on delete cascade,
  enrolled_at         timestamptz not null default now(),
  expires_at          timestamptz,
  status              text not null default 'active'
                        check (status in ('active', 'paused', 'suspended')),
  drip_interval_days  integer not null default 0,
  created_at          timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.enrollments enable row level security;

-- ─── LESSON OVERRIDES ────────────────────────────────────────
create table if not exists public.lesson_overrides (
  id                 uuid primary key default uuid_generate_v4(),
  enrollment_id      uuid not null references public.enrollments(id) on delete cascade,
  lesson_id          uuid not null references public.lessons(id) on delete cascade,
  manual_unlock_date timestamptz not null,
  created_at         timestamptz not null default now(),
  unique (enrollment_id, lesson_id)
);

alter table public.lesson_overrides enable row level security;

-- ─── PROGRESS ────────────────────────────────────────────────
create table if not exists public.progress (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.progress enable row level security;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- ─── profiles ────────────────────────────────────────────────
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── courses ─────────────────────────────────────────────────
create policy "Anyone authenticated can view published active courses"
  on public.courses for select
  using (auth.uid() is not null and is_published = true and is_active = true);

create policy "Admins have full access to courses"
  on public.courses for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── modules ─────────────────────────────────────────────────
create policy "Authenticated can view active modules"
  on public.modules for select
  using (auth.uid() is not null and is_active = true);

create policy "Admins have full access to modules"
  on public.modules for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── lessons ─────────────────────────────────────────────────
create policy "Authenticated can view active lessons"
  on public.lessons for select
  using (auth.uid() is not null and is_active = true);

create policy "Admins have full access to lessons"
  on public.lessons for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── enrollments ─────────────────────────────────────────────
create policy "Students can view own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id);

create policy "Admins have full access to enrollments"
  on public.enrollments for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── lesson_overrides ────────────────────────────────────────
create policy "Students can view own overrides"
  on public.lesson_overrides for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = enrollment_id and e.user_id = auth.uid()
    )
  );

create policy "Admins have full access to overrides"
  on public.lesson_overrides for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── progress ────────────────────────────────────────────────
create policy "Students can view and update own progress"
  on public.progress for all
  using (auth.uid() = user_id);

create policy "Admins can view all progress"
  on public.progress for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
