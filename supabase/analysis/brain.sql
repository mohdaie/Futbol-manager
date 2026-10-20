-- 1. Received data and actual storage, not estimates.
select 'sources' as kind, count(*) as rows from public.futbol_brain_sources
union all select 'recent decisions', count(*) from public.futbol_brain_decisions
union all select 'summary groups', count(*) from public.futbol_brain_summaries;

select relname, pg_size_pretty(pg_total_relation_size(c.oid)) as total_size
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and c.relname like 'futbol_brain_%';

-- 2. Compare choices in the same context, keeping engine and match kind separate.
select app_version, engine_version, kind, bucket, action, provider, decisions,
  round(average_outcome::numeric, 3) as average_reward,
  round(positive_outcome_rate::numeric, 3) as positive_outcome_rate,
  round(average_confidence::numeric, 3) as confidence, disagreements
from public.futbol_brain_analysis
where kind <> 'legacy' and decisions >= 30
order by app_version desc, engine_version, kind, bucket, average_outcome desc;

-- 3. High-confidence teacher decisions followed by poor results: review these.
select recorded_at, app_version, engine_version, kind, bucket, action, provider,
  confidence, outcome, details
from public.futbol_brain_decisions
where provider in ('jev', 'deepseek') and confidence >= 0.8 and outcome < 0
order by recorded_at desc limit 30;

-- 4. Inspect snapshots/tuning for a comparison before proposing engine changes.
select source_id, name, updated_at, data from public.futbol_brain_snapshots
where name like 'config:%' or name like 'version:%'
order by updated_at desc limit 20;

-- 5. Retention and skipped detail counts (summaries still preserve that learning).
select jobname, schedule, active from cron.job where jobname = 'futbol-brain-retention';
select last_seen, records_received, details_omitted from public.futbol_brain_sources
order by last_seen desc limit 20;
