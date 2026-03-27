create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'username', '')), '')
  )
  on conflict (id) do update
    set username = coalesce(
      nullif(trim(excluded.username), ''),
      public.profiles.username
    ),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute procedure public.handle_new_user_profile();

create or replace function public.sync_profile_username_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set username = nullif(trim(coalesce(new.raw_user_meta_data->>'username', '')), ''),
      updated_at = timezone('utc', now())
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated_profile on auth.users;

create trigger on_auth_user_updated_profile
after update of raw_user_meta_data on auth.users
for each row
execute procedure public.sync_profile_username_from_auth();

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);
