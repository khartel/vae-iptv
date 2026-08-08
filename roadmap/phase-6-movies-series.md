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

## Status (2026-08-08): complete

**Verified real API shapes before coding**, per the instructions above:

- `get_vod_categories` / `get_series_categories`: identical shape to live categories — reused as `XtreamCategory`.
- `get_vod_streams`: confirmed `container_extension` (`mp4`/`mkv`) per item, not HLS — the roadmap's risk callout was correct.
- `get_vod_info`: returns `{info, movie_data}` — `movie_data.container_extension` is what's needed to build the playback URL, so movie details pages are refresh-safe (fetch-by-id, no router-state dependency, unlike the live player).
- `get_series` / `get_series_info`: series list includes embedded `seasons`; `get_series_info` returns `{seasons, info, episodes}` with `episodes` keyed by season number string, each episode carrying its own `container_extension`.
- Confirmed both `/movie/{user}/{pass}/{id}.{ext}` and `/series/{user}/{pass}/{id}.{ext}` URL conventions resolve (302, same redirect-to-relay-CDN pattern as live).

**Real bug found and fixed via actual browser testing**: `VideoPlayer` always tried hls.js first regardless of file type. Pointed at a `.mkv` movie URL, hls.js tried to fetch and parse it as an HLS manifest via XHR, which hit a genuine CORS rejection (the provider's CORS headers are scoped to the API, not media files) — a different, real failure mode from the anticipated "MKV codec unsupported" risk. Fixed by only engaging hls.js/native-HLS for actual `.m3u8` URLs; anything else goes straight to `video.src` for the browser's native decoder. This fix applies to both movie and episode playback since they share `VideoPlayer`.

**Architecture decisions**:

- Reused a single `PosterCard` component for both Movies and Series grids (2:3 poster aspect, rating badge, hover overlay), per the "generic MediaCard" instruction — distinct from `ChannelCard` (16:9, Live badge, EPG) since live channels and VOD posters are genuinely different visual objects, not just styling variants of the same thing.
- Extracted a shared `useAsyncResource` hook to de-duplicate the fetch/loading/error boilerplate that was about to be copy-pasted a 4th and 5th time (VOD categories/streams, series categories/list). Left the pre-existing `useLiveCategories`/`useLiveStreams` as-is rather than retrofitting them — working, tested code, low value in touching it this late for a naming-consistency-only gain.
- Movie/episode playback uses an inline full-screen overlay on the details page (`position: fixed`, `AnimatePresence`) rather than a separate routed player page — reuses `VideoPlayer` exactly as instructed, avoids a second state-passing pattern to keep in sync, and episode prev/next naturally scopes to "the season currently being browsed."
- `MoviesPage`/`SeriesPage` mirror `LiveTvPage`'s exact pattern (URL-persisted category + search, independent-scroll two-column layout, batched "Load more") for consistency, including the same 60-item batching given some VOD/series categories are similarly large.

**Verified end-to-end against the real provider** via headless Chromium: real movie ("House of Ka") with poster/genre/cast/description, working Play → native `<video>` engaging (no CORS error, confirms the fix); real series ("A Monster Uncovered") with season tabs and per-episode descriptions from the actual catalog.
