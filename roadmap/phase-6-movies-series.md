# Phase 6 — Movies and Series

## Goal

Extend the app beyond Live TV to VOD content: movie browsing/playback, and series with seasons/episodes.

## Prerequisites

- Phase 4 (Live TV) and Phase 5 (EPG) stable — do not start this phase if Live TV still has open bugs.

## Tasks

**Movies**

1. `getVodCategories()` / `getVodStreams()` in the API service.
2. Movie grid with poster art.
3. Search.
4. Details page (description, year, rating if provided).
5. Playback (reuse the Phase 3 `<VideoPlayer>` — VOD streams use a different URL pattern than live, but the player itself shouldn't need to change).

**Series**

1. `getSeriesCategories()` / `getSeries()` / `getSeriesInfo(seriesId)`.
2. Series grid with poster art.
3. Season/episode navigation.
4. Episode playback (same player reuse as movies).

## Instructions for AI agents

- Reuse the existing `<VideoPlayer>` component from Phase 3 rather than building a second player — VOD and live differ only in URL construction, not in playback mechanics.
- Reuse `ChannelCard`-equivalent patterns from Phase 4 (a generic `MediaCard` component) rather than duplicating grid/list code for movies vs. series vs. channels.
- Verify VOD stream URL construction against the real API — Xtream's VOD URL pattern differs from the live pattern (typically includes file extension).

## Testing / verification

- Manual walkthrough: browse movie categories → search → open details → play. Repeat for a series: browse → select season → select episode → play.

## Risks

- VOD stream URLs sometimes include container extensions (`.mp4`, `.mkv`) that aren't HLS at all — playback approach may need a plain `<video src>` path alongside the hls.js path used for live.
- Large poster images without lazy loading can hurt initial grid render performance.

## Definition of done

- Movies and Series are both browsable, searchable, and playable, sharing the player and card components built in earlier phases rather than duplicating them.
