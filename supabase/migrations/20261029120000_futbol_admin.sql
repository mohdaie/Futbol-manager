-- Admin page (/admin): global game settings and server-held AI API keys.
-- Both tables are reachable only through the futbol-admin edge function (service role).
create table if not exists public.futbol_admin_settings (
  id text primary key check (char_length(id) <= 40),
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.futbol_admin_secrets (
  name text primary key check (name in ('jev', 'deepseek')),
  value text not null check (char_length(value) between 8 and 400),
  updated_at timestamptz not null default now()
);
alter table public.futbol_admin_settings enable row level security;
alter table public.futbol_admin_secrets enable row level security;
revoke all on public.futbol_admin_settings, public.futbol_admin_secrets from public, anon, authenticated;
grant select, insert, update, delete on public.futbol_admin_settings, public.futbol_admin_secrets to service_role;
comment on table public.futbol_admin_secrets is 'Server-side AI API keys. Never exposed to browsers; read only by edge functions.';

-- Usage summary across every installation (admin page).
create or replace function public.futbol_ai_usage_overview()
returns jsonb language sql stable security invoker set search_path = '' as $$
  with r as (select * from public.futbol_manager_ai_requests where created_at > now() - interval '400 days')
  select jsonb_build_object(
    'month', coalesce((select jsonb_agg(t) from (select provider, count(*) as calls, count(*) filter (where http_status >= 400) as fails,
      coalesce(sum(input_tokens),0) as input, coalesce(sum(output_tokens),0) as output, round(coalesce(sum(cost_usd),0)::numeric,6) as cost,
      coalesce(round(avg(duration_ms)),0) as ms, count(distinct source_id) as installs
      from r where created_at >= date_trunc('month', now()) group by provider) t), '[]'::jsonb),
    'total', coalesce((select jsonb_agg(t) from (select provider, count(*) as calls, round(coalesce(sum(cost_usd),0)::numeric,6) as cost from r group by provider) t), '[]'::jsonb),
    'features', coalesce((select jsonb_agg(t order by t.cost desc) from (select provider, coalesce(feature,'other') as feature, count(*) as calls,
      coalesce(sum(input_tokens+output_tokens),0) as tokens, round(coalesce(sum(cost_usd),0)::numeric,6) as cost
      from r where created_at > now() - interval '30 days' group by 1,2) t), '[]'::jsonb),
    'days', coalesce((select jsonb_agg(t order by t.day) from (select to_char(date_trunc('day',created_at),'YYYY-MM-DD') as day, provider, count(*) as calls,
      round(coalesce(sum(cost_usd),0)::numeric,6) as cost from r where created_at > now() - interval '14 days' group by 1,2) t), '[]'::jsonb));
$$;
revoke all on function public.futbol_ai_usage_overview() from public, anon, authenticated;
grant execute on function public.futbol_ai_usage_overview() to service_role;
