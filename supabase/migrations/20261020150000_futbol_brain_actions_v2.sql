-- Engine v2 manager decisions: style switches, transition instructions and player instructions.
alter table public.futbol_brain_summaries drop constraint if exists futbol_brain_summaries_action_check;
alter table public.futbol_brain_summaries add constraint futbol_brain_summaries_action_check
  check (action in ('attack','hold','defend','press','fresh','restyle','counter','cpress','protect','mark'));
