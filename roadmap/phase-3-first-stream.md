# Phase 3 — First Stream (First Major Milestone)

## Goal

Prove the full chain end-to-end: authenticate → fetch one channel → build its stream URL → play it in-browser. This is the milestone the whole MVP hinges on.

## Prerequisites

- Phase 2 complete (auth + connection validation working).

## Tasks

1. Extend `xtreamApi.ts` with `getLiveCategories()` and `getLiveStreams(categoryId)`.
2. Pick one known-good channel (from Phase 0 findings) and construct its stream URL per Xtream's URL convention.
3. Install and configure `hls.js`.
4. Build a minimal `<VideoPlayer>` component: HTML5 `<video>` + hls.js attach logic, with a native-HLS fallback path (Safari-style `canPlayType`) for completeness.
5. Wire one hardcoded channel through to the player on a bare test page.
6. Handle playback failure (bad URL, network error, unsupported codec) with a visible error state.

## Instructions for AI agents

- Keep scope tight: ONE channel, hardcoded selection is fine here — channel _selection UI_ is Phase 4, not this phase.
- Explain HLS, `.m3u8`, hls.js's role, and why native `<video>` alone isn't enough on most browsers, before writing the player component.
- If Phase 0 found the provider serves MPEG-TS rather than HLS, flag this explicitly before building — the player approach may need to change (this is exactly the kind of finding Phase 0 exists to surface early).
- Test with the real provider stream, not a public demo HLS URL — a demo stream passing doesn't prove this provider's streams work.

## Testing / verification

```bash
npm run dev
```

Expect: navigating to the test page starts playback of the real authorized channel within a few seconds, with visible loading state before playback starts and a visible error message if the stream fails.

## Risks

- CORS on the stream URL itself (separate from the API CORS check in Phase 0) — video/stream servers sometimes have different CORS policies than the API server.
- Codec incompatibility (HEVC) causing silent black-screen playback with no error — verify audio/video actually renders, not just that hls.js reports "attached."

## Definition of done

- A real, authorized channel plays back successfully in the browser, with working loading and error states. This is the proof-of-concept milestone — celebrate it, then move to Phase 4.

## Status (2026-08-08): code complete, playback unverified — open network issue

Everything up to actual pixels-on-screen is built and verified against the real provider:

- `getLiveCategories()` / `getLiveStreams(categoryId)` added to `xtreamApi.ts`, tested against the real account (351 real categories, real channel lists with real `stream_id`s pulled back correctly).
- `buildLiveStreamUrl()` constructs the Xtream live URL convention (`/live/{user}/{pass}/{id}.{ext}`).
- `src/components/VideoPlayer.tsx` built: hls.js when supported, native HLS fallback (Safari-style `canPlayType`), loading/error UI states, cleans up the `Hls` instance on unmount/src change.
- `App.tsx` wires a hardcoded real channel (`UK - BBC 1 HD`, stream ID `17402`) through login → player.
- The **error path is confirmed working correctly**: hls.js correctly reports `networkError: manifestLoadError` and the UI renders it.

**What's blocking a full pass**: this provider redirects every live stream request (`player_api.php` → `.m3u8`) with a `302` to a rotating relay/CDN hostname (e.g. `4921332.xelovrix.cc`, `...nodivorn.cc`, `...evorvixa.cc` — different hostnames, same small IP range `149.57.86.0/24`). The origin panel (`supmag66.xyz`) is always reached fine and issues the redirect correctly. The redirect **target** then times out — confirmed across:

- 6+ different channels (UK and USA, ruling out one dead channel/node)
- `curl` (both default and explicit `http://`)
- Real headless Chromium via Playwright (`net::ERR_CONNECTION_TIMED_OUT`)
- VLC directly (`Your input can't be opened`)

Meanwhile the **TV app, on the same account and same router, plays channels successfully at the same moment** — isolating this to something specific to the dev PC's network path (not the account, not the app code, not curl/browser/VLC-specific). Windows Security → Protection history showed nothing blocked, so it's likely not Defender flagging the relay hostnames (though that remained a live hypothesis given their DGA-like naming). A mobile-hotspot test (different network path entirely, bypassing whatever the PC/router does) would be the fastest way to fully isolate router/ISP vs. OS-level — not yet run (no mobile data available at the time).

**Decision**: per user, proceeding to Phase 4 (Live TV interface) rather than blocking on this — the playback code is written and ready, it just hasn't been visually confirmed end-to-end yet. Revisit this the next time this app is opened from a different network (or once the PC's network path to `149.57.86.0/24` is otherwise resolved) to get the actual "video plays" confirmation Phase 3's definition of done calls for.
