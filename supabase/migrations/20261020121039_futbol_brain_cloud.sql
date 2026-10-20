-- Private research data. Browser access goes through futbol-brain only.
create table public.futbol_brain_sources (
  id text primary key check (id ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  last_seq bigint not null default 0,
  last_digest text,
  window_at timestamptz not null default now(),
  window_requests integer not null default 0,
  records_received bigint not null default 0,
  details_omitted bigint not null default 0
);

create table public.futbol_brain_summaries (
  source_id text not null references public.futbol_brain_sources(id),
  app_version text not null,
  engine_version text not null,
  kind text not null check (kind in ('live','instant','background','camp','legacy')),
  bucket text not null,
  action text not null check (action in ('attack','hold','defend','press','fresh')),
  provider text not null check (provider in ('jev','deepseek','learned','rules','explore','legacy')),
  n bigint not null check (n > 0),
  reward_sum double precision not null,
  reward_sq double precision not null,
  positive bigint not null default 0,
  negative bigint not null default 0,
  confidence_sum double precision not null default 0,
  confidence_n bigint not null default 0,
  disagreements bigint not null default 0,
  teacher_votes bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (source_id, app_version, engine_version, kind, bucket, action, provider)
);

create table public.futbol_brain_decisions (
  source_id text not null references public.futbol_brain_sources(id),
  event_id uuid not null,
  recorded_at timestamptz not null,
  received_at timestamptz not null default now(),
  app_version text not null,
  engine_version text not null,
  kind text not null,
  bucket text not null,
  action text not null,
  provider text not null,
  outcome double precision not null,
  confidence double precision,
  details jsonb not null,
  primary key (source_id, event_id)
);
create index futbol_brain_decisions_retention on public.futbol_brain_decisions(received_at);
create index futbol_brain_decisions_analysis on public.futbol_brain_decisions(app_version, engine_version, kind, recorded_at desc);

create table public.futbol_brain_snapshots (
  source_id text not null references public.futbol_brain_sources(id),
  name text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (source_id, name)
);

alter table public.futbol_brain_sources enable row level security;
alter table public.futbol_brain_summaries enable row level security;
alter table public.futbol_brain_decisions enable row level security;
alter table public.futbol_brain_snapshots enable row level security;
revoke all on public.futbol_brain_sources, public.futbol_brain_summaries, public.futbol_brain_decisions, public.futbol_brain_snapshots from public, anon, authenticated;
grant select, insert, update on public.futbol_brain_sources, public.futbol_brain_summaries, public.futbol_brain_decisions, public.futbol_brain_snapshots to service_role;

-- One atomic transaction per immutable client batch. A retry cannot add totals twice,
-- even after detailed rows have expired. Source identity is derived from a random
-- installation token by the Edge Function, never taken from the posted body.
create function public.futbol_brain_ingest(p_source text, p_digest text, p_batch jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  s public.futbol_brain_sources%rowtype;
  seq bigint := (p_batch->>'seq')::bigint;
  r jsonb;
  inserted integer;
begin
  if octet_length(p_batch::text) > 524288 or seq < 1 then raise exception 'invalid_batch'; end if;
  insert into public.futbol_brain_sources(id) values(p_source) on conflict do nothing;
  select * into s from public.futbol_brain_sources where id = p_source for update;
  if seq = s.last_seq and p_digest = s.last_digest then
    return jsonb_build_object('ack', seq, 'duplicate', true, 'received', s.records_received);
  end if;
  if seq <> s.last_seq + 1 then raise exception 'sequence_conflict'; end if;
  if s.window_at < now() - interval '1 hour' then s.window_at := now(); s.window_requests := 0; end if;
  if s.window_requests >= 600 then raise exception 'rate_limited'; end if;

  for r in select value from jsonb_array_elements(p_batch->'stats') loop
    insert into public.futbol_brain_summaries as old
      (source_id, app_version, engine_version, kind, bucket, action, provider, n, reward_sum, reward_sq, positive, negative, confidence_sum, confidence_n, disagreements, teacher_votes)
    values (p_source, r->>'v', r->>'e', r->>'k', r->>'b', r->>'a', r->>'s', (r->>'n')::bigint, (r->>'r')::float8, (r->>'q')::float8, (r->>'w')::bigint, (r->>'l')::bigint, (r->>'c')::float8, (r->>'cn')::bigint, (r->>'d')::bigint, (r->>'tv')::bigint)
    on conflict (source_id, app_version, engine_version, kind, bucket, action, provider) do update set
      n = old.n + excluded.n, reward_sum = old.reward_sum + excluded.reward_sum, reward_sq = old.reward_sq + excluded.reward_sq,
      positive = old.positive + excluded.positive, negative = old.negative + excluded.negative,
      confidence_sum = old.confidence_sum + excluded.confidence_sum, confidence_n = old.confidence_n + excluded.confidence_n,
      disagreements = old.disagreements + excluded.disagreements, teacher_votes = old.teacher_votes + excluded.teacher_votes, updated_at = now();
  end loop;

  insert into public.futbol_brain_decisions(source_id, event_id, recorded_at, app_version, engine_version, kind, bucket, action, provider, outcome, confidence, details)
  select p_source, (r->>'id')::uuid, to_timestamp((r->>'t')::float8 / 1000), r->>'v', r->>'e', r->>'k', r->>'b', r->>'a', r->>'s', (r->>'o')::float8, (r->>'c')::float8, r->'details'
  from jsonb_array_elements(p_batch->'records') r
  on conflict do nothing;
  get diagnostics inserted = row_count;

  for r in select value from jsonb_array_elements(p_batch->'snapshots') loop
    insert into public.futbol_brain_snapshots(source_id, name, data) values(p_source, r->>'name', r->'data')
    on conflict (source_id, name) do update set data = excluded.data, updated_at = now();
  end loop;
  update public.futbol_brain_sources set last_seq = seq, last_digest = p_digest, last_seen = now(),
    window_at = s.window_at, window_requests = s.window_requests + 1,
    records_received = s.records_received + inserted,
    details_omitted = s.details_omitted + coalesce((p_batch->>'omitted')::bigint, 0)
  where id = p_source;
  return jsonb_build_object('ack', seq, 'received', s.records_received + inserted);
end;
$$;
revoke all on function public.futbol_brain_ingest(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.futbol_brain_ingest(text,text,jsonb) to service_role;

-- Private analysis view: source contributions stay separate underneath, preventing
-- client cumulative totals from being accidentally counted twice.
create view public.futbol_brain_analysis with (security_invoker = true) as
select app_version, engine_version, kind, bucket, action, provider,
  count(distinct source_id) as sources, sum(n) as decisions,
  sum(reward_sum) / sum(n) as average_outcome,
  case when kind <> 'legacy' then sqrt(greatest(0, sum(reward_sq) / sum(n) - power(sum(reward_sum) / sum(n), 2))) end as outcome_stddev,
  case when kind <> 'legacy' then sum(positive)::float8 / sum(n) end as positive_outcome_rate,
  sum(confidence_sum) / nullif(sum(confidence_n), 0) as average_confidence,
  sum(disagreements) as disagreements, sum(teacher_votes) as teacher_votes
from public.futbol_brain_summaries group by app_version, engine_version, kind, bucket, action, provider;
revoke all on public.futbol_brain_analysis from public, anon, authenticated;
grant select on public.futbol_brain_analysis to service_role;

-- Detailed records expire; summaries, snapshots and deduplication checkpoints stay.
create function public.futbol_brain_prune() returns bigint
language plpgsql security invoker set search_path = '' as $$
declare n bigint;
begin
  delete from public.futbol_brain_decisions where ctid in
    (select ctid from public.futbol_brain_decisions where received_at < now() - interval '30 days' limit 100000);
  get diagnostics n = row_count;
  return n;
end;
$$;
revoke all on function public.futbol_brain_prune() from public, anon, authenticated;
grant execute on function public.futbol_brain_prune() to service_role;
grant delete on public.futbol_brain_decisions to service_role;
create extension if not exists pg_cron;
select cron.schedule('futbol-brain-retention', '17 * * * *', 'select public.futbol_brain_prune();');

comment on table public.futbol_brain_summaries is 'Permanent per-installation research aggregates. Client-submitted evidence, not automatically approved engine changes.';
comment on table public.futbol_brain_decisions is '30-day compact decision details; no API keys, manager names or prompts.';
