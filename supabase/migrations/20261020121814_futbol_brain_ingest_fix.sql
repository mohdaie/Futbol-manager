-- Qualify the recordset value to avoid a PL/pgSQL loop-variable collision.
create or replace function public.futbol_brain_ingest(p_source text, p_digest text, p_batch jsonb)
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
  select p_source, (item.value->>'id')::uuid, to_timestamp((item.value->>'t')::float8 / 1000), item.value->>'v', item.value->>'e', item.value->>'k', item.value->>'b', item.value->>'a', item.value->>'s', (item.value->>'o')::float8, (item.value->>'c')::float8, item.value->'details'
  from jsonb_array_elements(p_batch->'records') as item(value)
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
