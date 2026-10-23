# Match movement evidence

New positional matches involving the managed club record both teams. Background
club fixtures still use their existing fast model and do not claim full movement
coverage. Capture is observational: no random draws or tactical changes.

- Every engine tick (0.5 seconds), including restarts and celebrations: ball xyz,
  ownership and flight/restart kind; all 22 slots' xy, velocity, movement target
  and facing. Position precision matches playback at 0.01 metres.
- Slot occupants, named tactical roles, formations/instructions and attributes
  are preserved when lineups or tactics change.
- Carrier decisions retain every available option and its engine utility/risk,
  chosen receiver/utility, pressure, effective mental attributes and condition.
- Releases, intended/actual pass targets, flight times, offside line, first-touch
  success/chance, committed duels, shots/xG, actual arrivals/results, keeper
  movement/targets, defensive assignments, events and set-piece plans are logged.
- Every controlled breakaway evaluated by the keeper logic logs attacker range,
  actual/desired keeper position and speed. Stationary observations at 20–30m
  are evidence to investigate, not a rule requiring the keeper to rush.

Frames use independent minute-sized delta/zero-run blocks. Finished recordings
are additionally compressed losslessly with gzip in the background. The raw
recording remains intact if compression fails. Recordings persist with this
season's fixture records, durable career saves and exported backups. Export a
backup or download evidence before the next season replaces the fixture list.
Resumed live matches keep pending blocks and encoder state.

More → Admin → Match Analyst shows recording counts and **Download full evidence**.
Downloads decode every frame into integer rows, with the schema, player identity
and attribute map, tactical contexts, all actions and full stored event timeline.
Older matches retain their sparse trace: missing history cannot be reconstructed.

DeepSeek receives measurements computed over all recorded frames/actions and
selected continuous clips/action examples; it does **not** receive the entire
archive. Requests remain below the existing relay size limit. Compaction preserves
aggregate metrics and prioritizes a through-pass and keeper sequence where present.
Reports distinguish supplied excerpts, local measurements and hypotheses, and
cover movement/marking, pressing, passing/control, modeled mental decisions,
shooting/timing, keeping and set pieces for both teams. No access to proprietary
Football Manager code or live reference browsing is claimed. Rendering between
simulation ticks is not separately captured; flight metadata preserves shot curves
and keeper dive plans. Mental attributes are modeled inputs, not human thoughts.

Verification:

```
node tests/match-evidence.cjs
node tests/match-evidence-ui.cjs
node tests/match-analyst.cjs
node tests/football-motion.cjs
```

The full-match check compares captured positions with playback, verifies unchanged
random state/results/statistics/events and reconciles all shot xG. Browser checks
cover worker parity, compression, copy/download and durable save/reload.
