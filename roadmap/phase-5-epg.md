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

## Status (2026-08-08): complete

- **Confirmed real payload shape** before writing types (per instructions above): `get_short_epg&stream_id=X` returns `{"epg_listings":[{id, epg_id, title (base64), lang, start, end, description (base64), channel_id, start_timestamp, stop_timestamp}, ...]}` — matches standard Xtream convention exactly. Verified base64 decoding against real data (`TWljaGFlbCBNY0ludHlyZSdzIEJpZyBTaG93` → "Michael McIntyre's Big Show").
- **Used `start_timestamp`/`stop_timestamp` (unix epoch) rather than the `start`/`end` string fields** — sidesteps the timezone-handling risk called out above entirely, since epoch converts unambiguously to the browser's local time via `Date`.
- **Lazy fetching, addressed directly**: rather than fetching EPG for every visible `ChannelCard` on mount (potentially dozens of concurrent requests per grid page), `useShortEpg` only fetches after ~300ms of continuous hover/focus on a card, with a module-level cache so repeat hovers are free. `PlayerPage` fetches immediately since there's only ever one active channel there.
- **`ChannelCard`**: shows the current program title under the channel name once hovered — verified against the real provider (e.g. "UK - BBC 1 HD" → "Pointless Celebrities").
- **`PlayerPage`**: "Up Next" panel in the header (matching the mockup exactly), current program title in the bottom bar (clickable), and a program detail modal (title, full description, formatted start–end time range) — verified end-to-end with real data via headless Chromium screenshots.
- **Graceful fallback**: cards/pages with no EPG data (or divider/placeholder "channels" some categories include) simply don't render the program line — confirmed via the "##### UK - GENERAL #####" placeholder entry, which correctly shows nothing rather than crashing.
- Skipped the optional simple timeline view — not attempted, no partial/broken version left behind.
