-- Skill catalog for Phase 2: shared suggestions, usage counts, ESCO enrichment.

create table if not exists public.skill_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null unique,
  esco_uri text unique,
  esco_type text,
  source text not null default 'seed' check (source in ('seed', 'esco', 'user')),
  usage_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists skill_catalog_name_idx on public.skill_catalog (name);
create index if not exists skill_catalog_usage_idx on public.skill_catalog (usage_count desc);

alter table public.skill_catalog enable row level security;

grant select on table public.skill_catalog to authenticated;

drop policy if exists "Skill catalog is readable by authenticated users" on public.skill_catalog;

create policy "Skill catalog is readable by authenticated users"
on public.skill_catalog
for select
to authenticated
using (true);

create or replace function public.normalize_skill_name(input text)
returns text
language sql
immutable
as $$
  select lower(trim(regexp_replace(coalesce(input, ''), '\s+', ' ', 'g')));
$$;

create or replace function public.search_skill_catalog(
  search_query text,
  result_limit int default 8
)
returns table (
  name text,
  usage_count int,
  source text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    sc.name,
    sc.usage_count,
    sc.source
  from public.skill_catalog sc
  where
    search_query = ''
    or sc.name ilike '%' || search_query || '%'
    or sc.normalized_name ilike '%' || public.normalize_skill_name(search_query) || '%'
  order by sc.usage_count desc, sc.name asc
  limit greatest(result_limit, 1);
$$;

create or replace function public.record_skill_usage(skill_names text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  skill_name text;
  normalized text;
  display_name text;
begin
  if skill_names is null then
    return;
  end if;

  foreach skill_name in array skill_names
  loop
    normalized := public.normalize_skill_name(skill_name);

    if normalized = '' then
      continue;
    end if;

    display_name := trim(regexp_replace(skill_name, '\s+', ' ', 'g'));

    insert into public.skill_catalog (name, normalized_name, source, usage_count)
    values (display_name, normalized, 'user', 1)
    on conflict (normalized_name) do update
    set usage_count = public.skill_catalog.usage_count + 1;
  end loop;
end;
$$;

create or replace function public.upsert_esco_skill(
  p_name text,
  p_esco_uri text,
  p_esco_type text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
  result_name text;
  display_name text;
begin
  normalized := public.normalize_skill_name(p_name);

  if normalized = '' then
    return null;
  end if;

  display_name := trim(regexp_replace(p_name, '\s+', ' ', 'g'));

  insert into public.skill_catalog (
    name,
    normalized_name,
    esco_uri,
    esco_type,
    source,
    usage_count
  )
  values (display_name, normalized, p_esco_uri, p_esco_type, 'esco', 0)
  on conflict (normalized_name) do update
  set
    esco_uri = coalesce(excluded.esco_uri, public.skill_catalog.esco_uri),
    esco_type = coalesce(excluded.esco_type, public.skill_catalog.esco_type),
    source = case
      when public.skill_catalog.source = 'seed' then 'esco'
      else public.skill_catalog.source
    end
  returning name into result_name;

  return result_name;
end;
$$;

grant execute on function public.search_skill_catalog(text, int) to authenticated;
grant execute on function public.record_skill_usage(text[]) to authenticated;
grant execute on function public.upsert_esco_skill(text, text, text) to authenticated;

insert into public.skill_catalog (name, normalized_name, source)
values
  ('Manual Testing', 'manual testing', 'seed'),
  ('Test Cases', 'test cases', 'seed'),
  ('Bug Reporting', 'bug reporting', 'seed'),
  ('JIRA', 'jira', 'seed'),
  ('SQL Basics', 'sql basics', 'seed'),
  ('Agile', 'agile', 'seed'),
  ('Customer Support', 'customer support', 'seed'),
  ('Administration', 'administration', 'seed'),
  ('API Testing', 'api testing', 'seed'),
  ('Postman', 'postman', 'seed'),
  ('Selenium', 'selenium', 'seed'),
  ('Cypress', 'cypress', 'seed'),
  ('Playwright', 'playwright', 'seed'),
  ('JavaScript', 'javascript', 'seed'),
  ('TypeScript', 'typescript', 'seed'),
  ('Python', 'python', 'seed'),
  ('Java', 'java', 'seed'),
  ('C#', 'c#', 'seed'),
  ('React', 'react', 'seed'),
  ('Node.js', 'node.js', 'seed'),
  ('HTML', 'html', 'seed'),
  ('CSS', 'css', 'seed'),
  ('Git', 'git', 'seed'),
  ('CI/CD', 'ci/cd', 'seed'),
  ('Docker', 'docker', 'seed'),
  ('AWS', 'aws', 'seed'),
  ('Azure', 'azure', 'seed'),
  ('Linux', 'linux', 'seed'),
  ('Networking', 'networking', 'seed'),
  ('Help Desk', 'help desk', 'seed'),
  ('IT Support', 'it support', 'seed'),
  ('Active Directory', 'active directory', 'seed'),
  ('Microsoft Office', 'microsoft office', 'seed'),
  ('Excel', 'excel', 'seed'),
  ('Data Entry', 'data entry', 'seed'),
  ('Communication', 'communication', 'seed'),
  ('Problem Solving', 'problem solving', 'seed'),
  ('Attention to Detail', 'attention to detail', 'seed'),
  ('Regression Testing', 'regression testing', 'seed'),
  ('Smoke Testing', 'smoke testing', 'seed'),
  ('UAT', 'uat', 'seed'),
  ('Test Automation', 'test automation', 'seed'),
  ('REST APIs', 'rest apis', 'seed'),
  ('JSON', 'json', 'seed'),
  ('Scrum', 'scrum', 'seed'),
  ('Kanban', 'kanban', 'seed'),
  ('Technical Writing', 'technical writing', 'seed'),
  ('Stakeholder Management', 'stakeholder management', 'seed'),
  ('Incident Management', 'incident management', 'seed'),
  ('Service Desk', 'service desk', 'seed'),
  ('Troubleshooting', 'troubleshooting', 'seed'),
  ('Quality Assurance', 'quality assurance', 'seed'),
  ('Software Testing', 'software testing', 'seed'),
  ('Mobile Testing', 'mobile testing', 'seed'),
  ('Accessibility Testing', 'accessibility testing', 'seed'),
  ('Performance Testing', 'performance testing', 'seed')
on conflict (normalized_name) do nothing;
