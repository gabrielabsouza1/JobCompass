alter table public.profiles
add column if not exists target_roles text[] not null default '{}';
