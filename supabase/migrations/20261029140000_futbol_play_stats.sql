-- Anonymous play statistics for the /admin Dashboard (js/systems/telemetry.js -> futbol-admin POST /report).
-- device: a random id per browser (not linked to anyone). No names, saves or personal data. Kept 180 days.
create table if not exists public.futbol_play_events (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  kind text not null,
  device text not null,
  session text not null,
  version text not null,
  data jsonb not null default '{}'::jsonb
);
create index if not exists futbol_play_events_at on public.futbol_play_events (at);
create index if not exists futbol_play_events_device on public.futbol_play_events (device, at);
create index if not exists futbol_play_events_session on public.futbol_play_events (session, at);
alter table public.futbol_play_events enable row level security;
revoke all on public.futbol_play_events from anon, authenticated;
comment on table public.futbol_play_events is 'Anonymous play statistics (random per-browser id, sessions, minutes, careers, match results). No personal data. 180-day retention.';

create or replace function public.futbol_play_report(p_kind text, p_device text, p_session text, p_version text, p_data jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_kind not in ('open', 'play', 'career', 'match') then return; end if;
  if p_device !~ '^[0-9a-f]{32}$' or p_session !~ '^[0-9a-f]{32}$' or p_version !~ '^[0-9A-Za-z.\-?]{1,20}$' then return; end if;
  if jsonb_typeof(coalesce(p_data, '{}'::jsonb)) <> 'object' or pg_column_size(p_data) > 2048 then return; end if;
  -- At most 60 reports per session per hour, so one broken device cannot flood.
  if (select count(*) from futbol_play_events where session = p_session and at > now() - interval '1 hour') >= 60 then return; end if;
  insert into futbol_play_events (kind, device, session, version, data) values (p_kind, p_device, p_session, p_version, coalesce(p_data, '{}'::jsonb));
  if random() < 0.01 then delete from futbol_play_events where at < now() - interval '180 days'; end if;
end $$;

-- Days are Malaysia time (UTC+8), like the other dashboards on this project.
create or replace function public.futbol_play_dashboard(p_days integer default 30)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  tz constant text := 'Asia/Kuala_Lumpur';
  days int := least(greatest(coalesce(p_days, 30), 1), 180);
  today date := (now() at time zone tz)::date;
  since date := today - (days - 1);
  result jsonb;
begin
  with ev as (
    select e.*, (e.at at time zone tz)::date as d from futbol_play_events e where e.at >= (since::timestamp at time zone tz)
  ), first_seen as (
    select device, min((at at time zone tz)::date) as d from futbol_play_events group by device
  ), m as (
    select d, device, data->>'mode' as mode, data->>'res' as res, (data->>'gf')::int as gf, (data->>'ga')::int as ga from ev
    where kind = 'match' and data->>'gf' ~ '^\d{1,2}$' and data->>'ga' ~ '^\d{1,2}$'
  ), active_days as (
    select device, count(distinct d) as n from ev group by device
  )
  select jsonb_build_object(
    'now', now(), 'days', days, 'today', today,
    'players', jsonb_build_object(
      'today', (select count(distinct device) from ev where d = today),
      'week', (select count(distinct device) from ev where d > today - 7),
      'period', (select count(distinct device) from ev),
      'allTime', (select count(*) from first_seen),
      'newToday', (select count(*) from first_seen where d = today),
      'newPeriod', (select count(*) from first_seen where d >= since),
      'returning', (select count(*) from active_days where n >= 2)),
    'totals', jsonb_build_object(
      'sessions', (select count(*) from ev where kind = 'open'),
      'minutes', (select coalesce(round(sum(least(greatest((data->>'sec')::numeric, 0), 3600)) / 60), 0) from ev where kind = 'play' and data->>'sec' ~ '^\d{1,6}$'),
      'careers', (select count(*) from ev where kind = 'career'),
      'matches', (select count(*) from m),
      'watched', (select count(*) from m where mode = 'watched'),
      'instant', (select count(*) from m where mode = 'instant'),
      'wins', (select count(*) from m where res = 'W'),
      'draws', (select count(*) from m where res = 'D'),
      'losses', (select count(*) from m where res = 'L'),
      'goalsFor', (select coalesce(sum(gf), 0) from m),
      'goalsAgainst', (select coalesce(sum(ga), 0) from m)),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object(
        'day', g.d,
        'players', (select count(distinct device) from ev where ev.d = g.d),
        'new', (select count(*) from first_seen f where f.d = g.d),
        'sessions', (select count(*) from ev where ev.d = g.d and kind = 'open'),
        'minutes', (select coalesce(round(sum(least(greatest((data->>'sec')::numeric, 0), 3600)) / 60), 0) from ev where ev.d = g.d and kind = 'play' and data->>'sec' ~ '^\d{1,6}$'),
        'matches', (select count(*) from m where m.d = g.d),
        'careers', (select count(*) from ev where ev.d = g.d and kind = 'career')) order by g.d), '[]'::jsonb)
      from (select generate_series(since, today, interval '1 day')::date as d) g),
    'clubs', (select coalesce(jsonb_agg(jsonb_build_object('name', x.k, 'country', x.c, 'players', x.n) order by x.n desc, x.k), '[]'::jsonb) from (
      select left(data->>'club', 40) as k, max(left(data->>'country', 8)) as c, count(distinct device) as n from ev where data ? 'club' group by 1 order by 3 desc, 1 limit 15) x),
    'countries', (select coalesce(jsonb_object_agg(x.k, x.n), '{}'::jsonb) from (
      select left(data->>'country', 8) as k, count(distinct device) as n from ev where data ? 'country' group by 1) x),
    'devices', (select coalesce(jsonb_object_agg(x.k, x.n), '{}'::jsonb) from (
      select coalesce(left(data->>'form', 12), 'unknown') as k, count(distinct device) as n from ev where kind = 'open' group by 1) x),
    'versions', (select coalesce(jsonb_object_agg(x.k, x.n), '{}'::jsonb) from (
      select version as k, count(distinct device) as n from ev group by 1) x)
  ) into result;
  return result;
end $$;

revoke execute on function public.futbol_play_report(text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.futbol_play_dashboard(integer) from public, anon, authenticated;
grant execute on function public.futbol_play_report(text, text, text, text, jsonb) to service_role;
grant execute on function public.futbol_play_dashboard(integer) to service_role;
