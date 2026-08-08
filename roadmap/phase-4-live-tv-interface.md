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
