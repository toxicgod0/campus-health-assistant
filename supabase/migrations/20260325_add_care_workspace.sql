alter table public.profiles
add column if not exists username_change_used boolean not null default false;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, username_change_used)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'username', '')), ''),
    coalesce((new.raw_user_meta_data->>'username_change_used')::boolean, false)
  )
  on conflict (id) do update
    set username = coalesce(
      nullif(trim(excluded.username), ''),
      public.profiles.username
    ),
    username_change_used = coalesce(excluded.username_change_used, public.profiles.username_change_used),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.sync_profile_username_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set username = nullif(trim(coalesce(new.raw_user_meta_data->>'username', '')), ''),
      username_change_used = coalesce((new.raw_user_meta_data->>'username_change_used')::boolean, public.profiles.username_change_used),
      updated_at = timezone('utc', now())
  where id = new.id;

  return new;
end;
$$;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  appointment_at timestamptz not null,
  reason text,
  location text,
  notes text,
  status text not null default 'scheduled',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.appointments enable row level security;

drop policy if exists "Users can view their own appointments" on public.appointments;
create policy "Users can view their own appointments"
on public.appointments
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own appointments" on public.appointments;
create policy "Users can insert their own appointments"
on public.appointments
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own appointments" on public.appointments;
create policy "Users can update their own appointments"
on public.appointments
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own appointments" on public.appointments;
create policy "Users can delete their own appointments"
on public.appointments
for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.health_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  mood text,
  energy_level integer,
  symptoms text,
  notes text not null,
  self_care_plan text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.health_journal_entries enable row level security;

drop policy if exists "Users can view their own journal entries" on public.health_journal_entries;
create policy "Users can view their own journal entries"
on public.health_journal_entries
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own journal entries" on public.health_journal_entries;
create policy "Users can insert their own journal entries"
on public.health_journal_entries
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own journal entries" on public.health_journal_entries;
create policy "Users can update their own journal entries"
on public.health_journal_entries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own journal entries" on public.health_journal_entries;
create policy "Users can delete their own journal entries"
on public.health_journal_entries
for delete
to authenticated
using (auth.uid() = user_id);
