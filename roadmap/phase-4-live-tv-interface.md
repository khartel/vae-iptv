# Phase 4 — Live TV Interface

## Goal

Turn the Phase 3 proof-of-concept into a real Live TV browsing experience: categories, channel list, search, favorites, and a proper player layout — MVP scope defined in the architecture doc ends here (plus logout).

## Prerequisites

- Phase 3 complete (one stream provably plays).

## Tasks

1. Category list UI, driven by `getLiveCategories()`.
2. Channel grid/list UI per category, driven by `getLiveStreams()`, including channel logos where the API provides them.
3. Channel selection wired to the `<VideoPlayer>` from Phase 3 (replace hardcoded channel).
4. Search across channel names.
5. Favorites (local state/`localStorage` — no backend needed).
6. Loading states for category/channel fetches; error states for fetch failures.
7. Logout (clear session/credentials from memory, return to login screen).
8. Login screen: form for server URL/username/password, backed by the Phase 2 service, reading from `.env` in dev.

## Instructions for AI agents

- This phase completes the MVP as defined in the architecture doc: login, validation, categories, channels, display, select, play, error handling, loading states, logout. Nothing beyond that belongs in this phase.
- Use small, reusable components (`ChannelCard`, `CategoryList`, `SearchBar`) rather than one large page component.
- Virtualize the channel list if the provider's channel count is large (check Phase 0 findings) — janky scrolling on thousands of channels is a known risk, not a hypothetical.
- Do not start EPG, Movies, or Series work here even if it seems convenient — that's Phase 5/6.

## Testing / verification

- Manual walkthrough: login → browse categories → search → select a channel → it plays → mark a favorite → logout → favorites persist across a fresh login (if using `localStorage`).

## Risks

- Large channel lists causing render slowdowns — virtualize (e.g., `react-window`) if needed.
- Broken/missing channel logo URLs — need a fallback placeholder.

## Definition of done

- MVP is complete per the architecture doc's definition: full login-to-playback loop works with categories, search, favorites, loading/error states, and logout.

## Status (2026-08-08): implemented, using a real design system

The user provided three Google Stitch–generated HTML/Tailwind mockups (Home, Live TV, Video Player) plus a "VAE IPTV" logo, asking for them to be implemented as the real Phase 4 UI. Adopted "VAE IPTV" as the product name throughout.

**Design system** ported into `src/index.css` as a Tailwind v4 `@theme` block: exact color palette, spacing, and type scale from the mockups. Simplified the mockups' redundant per-size `font-*` family aliases (all resolved to Inter anyway) into a single `font-sans` override — same visual result, less config surface.

**Architecture addition**: added `react-router-dom` — the mockups are genuinely multi-page (browse vs. full-screen player), which the single-page test harness from Phases 2–3 couldn't represent. Routes: `/` (Home), `/live` (Live TV), `/watch/:streamId` (full-screen player, no side nav).

**Built**:

- `AuthContext` (`src/app/AuthContext.tsx`) — session-only credential storage (`sessionStorage`, not `localStorage`, so credentials don't persist past the browser tab closing), dev convenience fallback to `.env`, `login()`/`logout()`.
- `LoginPage` — real form (server URL/username/password), pre-filled from `.env` in dev.
- `AppLayout` — collapsible side nav (96px → 320px on hover) matching the mockup; Movies/Series/Favorites/EPG nav items are visually present but disabled with a "coming in a later phase" tooltip rather than dead links. Logout replaces the mockup's unbuilt Settings slot.
- `ChannelCard`, `useLiveCategories`, `useLiveStreams` (now supports fetching all channels with no `category_id`, matching the mockup's "All" category button), `useFavorites` (`localStorage`).
- `LiveTvPage` — real categories (this provider has 351), real channel grid, client-side search, favorite toggling. Added simple batch-rendering (60 at a time, "Load more") since "All channels" on this provider is easily 1,000+ — full virtualization deferred to Phase 7 as originally planned, this is just enough to not dump the whole list into the DOM at once.
- `PlayerPage` — full-screen, real hls.js playback via the Phase 3 `VideoPlayer`, prev/next channel switching using the list handed over via router state, favorite toggle, auto-hiding UI on inactivity (mouse/keyboard) matching the mockup.

**Bugs found and fixed via actual browser testing** (not just type-checking):

- `ChannelCard`'s root `<button>` had no explicit width; since all its children are `absolute`-positioned (no in-flow content), the button collapsed to near-zero size — cards rendered as invisible slivers. Fixed by adding `w-full`.
- `VideoPlayer`'s wrapper still had Phase 3's small-test-page sizing (`max-w-3xl aspect-video`), so inside the full-screen `PlayerPage` the video was stuck in a small box instead of filling the screen. Made the wrapper `className` configurable per use site.
- Wiring the full-screen layout surfaced that the mockup's center play/pause button had never actually been built (only prev/next existed). Added it properly: `VideoPlayer` now forwards a ref to the underlying `<video>` element via `forwardRef`/`useImperativeHandle`, and exposes a `controls` prop (native browser controls off for the full-screen player, on for any future minimal embeds) plus `onPlayingChange` so the custom button's icon stays in sync with real play/pause state.

**Verified via headless Chromium against the real provider**: Home page's "Live Now" rail renders real channels with real logos; Live TV page renders the full category sidebar and a 5-column channel grid with real data; clicking a card navigates to `/watch/:id` and the full-screen player renders correctly (still shows "Loading stream…" — the same Phase 3 network issue, not a new one, since it's the same redirect-CDN timeout on this dev machine).

The `iptv/` reference folder (the raw Stitch HTML exports) has been deleted per the user's instruction — its content is now fully absorbed into the real components above.
