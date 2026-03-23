-- Fix Infinite Recursion in RLS by using a Security Definer function
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILE POLICIES
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can manage all profiles" on public.profiles;

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin());

-- COURSES POLICIES
drop policy if exists "Admins have full access to courses" on public.courses;
create policy "Admins have full access to courses"
  on public.courses for all
  using (public.is_admin());

-- MODULES POLICIES
drop policy if exists "Admins have full access to modules" on public.modules;
create policy "Admins have full access to modules"
  on public.modules for all
  using (public.is_admin());

-- LESSONS POLICIES
drop policy if exists "Admins have full access to lessons" on public.lessons;
create policy "Admins have full access to lessons"
  on public.lessons for all
  using (public.is_admin());

-- ENROLLMENTS POLICIES
drop policy if exists "Admins have full access to enrollments" on public.enrollments;
create policy "Admins have full access to enrollments"
  on public.enrollments for all
  using (public.is_admin());

-- OVERRIDES POLICIES
drop policy if exists "Admins have full access to overrides" on public.lesson_overrides;
create policy "Admins have full access to overrides"
  on public.lesson_overrides for all
  using (public.is_admin());

-- PROGRESS POLICIES
drop policy if exists "Admins can view all progress" on public.progress;
create policy "Admins can view all progress"
  on public.progress for select
  using (public.is_admin());
