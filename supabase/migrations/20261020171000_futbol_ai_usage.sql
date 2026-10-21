-- AI usage statistics for Jev and DeepSeek. The relays already log every call here; they now also
-- record which game feature made the call, cache-hit tokens, the cost in US$, and the anonymous
-- installation (SHA-256 of the AI Brain installation credential, as in futbol_brain_sources).
alter table public.futbol_manager_ai_requests
  add column if not exists feature text check (char_length(feature) <= 40),
  add column if not exists cache_hit_tokens integer not null default 0 check (cache_hit_tokens >= 0),
  add column if not exists cost_usd numeric(14, 8) not null default 0 check (cost_usd >= 0),
  add column if not exists source_id text check (source_id ~ '^[a-f0-9]{64}$');
create index if not exists futbol_manager_ai_requests_source_idx
  on public.futbol_manager_ai_requests (source_id, created_at desc);

-- Usage summary for one installation, plus totals across every installation.
create or replace function public.futbol_ai_usage_stats(p_source text)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with r as (select * from public.futbol_manager_ai_requests where created_at > now() - interval '400 days'),
  mine as (select * from r where source_id = p_source),
  agg as (
    select provider, count(*) as calls, count(*) filter (where http_status >= 400) as fails,
      coalesce(sum(input_tokens), 0) as input, coalesce(sum(output_tokens), 0) as output,
      coalesce(sum(cache_hit_tokens), 0) as cache, round(coalesce(sum(cost_usd), 0)::numeric, 6) as cost,
      coalesce(round(avg(duration_ms)), 0) as ms
    from mine where created_at >= date_trunc('month', now()) group by provider)
  select jsonb_build_object(
    'month', coalesce((select jsonb_agg(to_jsonb(agg)) from agg), '[]'::jsonb),
    'total', coalesce((select jsonb_agg(jsonb_build_object('provider', provider, 'calls', calls, 'input', input, 'output', output, 'cost', cost)) from
      (select provider, count(*) as calls, coalesce(sum(input_tokens), 0) as input, coalesce(sum(output_tokens), 0) as output, round(coalesce(sum(cost_usd), 0)::numeric, 6) as cost from mine group by provider) t), '[]'::jsonb),
    'features', coalesce((select jsonb_agg(jsonb_build_object('provider', provider, 'feature', feature, 'calls', calls, 'tokens', tokens, 'cost', cost) order by cost desc, calls desc) from
      (select provider, coalesce(feature, 'other') as feature, count(*) as calls, coalesce(sum(input_tokens + output_tokens), 0) as tokens, round(coalesce(sum(cost_usd), 0)::numeric, 6) as cost
       from mine where created_at > now() - interval '30 days' group by 1, 2) t), '[]'::jsonb),
    'days', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'provider', provider, 'calls', calls, 'tokens', tokens, 'cost', cost) order by day) from
      (select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day, provider, count(*) as calls, coalesce(sum(input_tokens + output_tokens), 0) as tokens, round(coalesce(sum(cost_usd), 0)::numeric, 6) as cost
       from mine where created_at > now() - interval '14 days' group by 1, 2) t), '[]'::jsonb),
    'everyone', coalesce((select jsonb_agg(jsonb_build_object('provider', provider, 'installs', installs, 'calls', calls, 'tokens', tokens, 'cost', cost)) from
      (select provider, count(distinct source_id) as installs, count(*) as calls, coalesce(sum(input_tokens + output_tokens), 0) as tokens, round(coalesce(sum(cost_usd), 0)::numeric, 6) as cost
       from r where created_at >= date_trunc('month', now()) group by provider) t), '[]'::jsonb));
$$;
revoke all on function public.futbol_ai_usage_stats(text) from public, anon, authenticated;
grant execute on function public.futbol_ai_usage_stats(text) to service_role;
grant update on public.futbol_manager_ai_requests to service_role;
-- Estimated cost for calls logged before this change (off-peak list prices, no cache hits).
update public.futbol_manager_ai_requests set cost_usd = case
  when provider = 'jev' then input_tokens * 0.042 / 1e6
  when model = 'deepseek-v4-pro' then (input_tokens * 0.66 + output_tokens * 1.98) / 1e6
  else (input_tokens * 0.15 + output_tokens * 0.6) / 1e6 end
where cost_usd = 0 and http_status < 400;
comment on table public.futbol_manager_ai_requests is
  'Futbol Manager AI call log: diagnostics, tokens, cost and feature. Never store API keys, prompts or player data.';
