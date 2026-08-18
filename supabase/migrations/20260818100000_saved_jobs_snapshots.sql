alter table public.saved_jobs
add column if not exists job_snapshot jsonb not null default '{}';

create index if not exists saved_jobs_user_id_idx on public.saved_jobs (user_id);
