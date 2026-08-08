# Phase 5 — EPG (Electronic Program Guide)

## Goal

Show what's currently playing and what's coming up next, per channel, sourced from the Xtream EPG endpoint(s).

## Prerequisites

- Phase 4 complete (MVP Live TV interface working).

## Tasks

1. Add `getShortEpg(streamId)` / `getFullEpg(streamId)` (or provider's XMLTV endpoint, whichever Xtream exposes) to the API service.
2. Parse EPG payload (often base64-encoded fields per Xtream convention — verify against real response, don't assume).
3. Display current + next program on each `ChannelCard`.
4. Program detail view: title, description, start/end time.
5. Optional: simple timeline view for a selected channel.

## Instructions for AI agents

- Confirm the actual EPG payload shape against the real API before writing the parser — Xtream implementations vary provider-to-provider more here than for live streams.
- Keep EPG fetches lazy/on-demand or lightly cached; don't fetch full EPG for every channel eagerly, it's typically a heavy payload.
- This phase attaches metadata to the existing Phase 4 UI — it should not require restructuring the channel list/grid.

## Testing / verification

- Manual check: selecting a known channel shows a plausible current program title/time matching what's actually airing.

## Risks

- Inconsistent or missing EPG data from some providers/channels — needs a graceful "no program data" fallback, not a crash.
- Timezone handling — EPG timestamps need correct conversion to local time.

## Definition of done

- Channels display current/next program info sourced from the real EPG endpoint, with a sane fallback when data is missing.
