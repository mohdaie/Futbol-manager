create table public.futbol_manager_ai_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  provider text not null default 'jev' check (provider in ('jev', 'deepseek')),
  model text not null check (char_length(model) between 1 and 100),
  http_status integer not null check (http_status between 100 and 599),
  duration_ms integer not null check (duration_ms >= 0),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  error_code text check (char_length(error_code) <= 64)
);
create index futbol_manager_ai_requests_created_at_idx
  on public.futbol_manager_ai_requests (created_at desc);
alter table public.futbol_manager_ai_requests enable row level security;
revoke all on public.futbol_manager_ai_requests from public, anon, authenticated;
grant select, insert on public.futbol_manager_ai_requests to service_role;
comment on table public.futbol_manager_ai_requests is
  'Futbol Manager connection diagnostics only. Never store API keys, prompts or player data.';
