alter table public.profiles
add column if not exists skills text[] not null default '{}';
