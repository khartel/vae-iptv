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
