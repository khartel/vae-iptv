# Phase 9 — Production-Quality Improvements

## Goal

Harden the working app: resilience, security review, performance, and UX polish — applied last, once functionality across all platforms is proven.

## Prerequisites

- Phase 8 complete (working on real LG TV).

## Tasks

1. Add React error boundaries around major sections (player, channel grid) so one failure doesn't blank the whole app.
2. Add structured logging for playback failures/auth failures (local console/dev-only; no remote telemetry unless the user explicitly wants it).
3. Performance pass: bundle size, unnecessary re-renders, image loading strategy.
4. Security review: re-confirm no credentials are logged, committed, or exposed in bundled output; review `.env` handling end-to-end.
5. Caching: EPG cache with sensible TTL, channel-list cache to reduce cold-start latency.
6. UX polish pass: transitions, empty states, edge-case error messaging.

## Instructions for AI agents

- This phase is explicitly last — do not pull hardening work forward into earlier phases beyond what's already specified there (e.g., basic error handling in Phase 2/3 is not this phase's job to invent, only to harden).
- The security review should specifically re-check: is anything credential-related ever sent anywhere other than the user's own provider's server? Is `.env` still gitignored? Does the production build embed anything sensitive in a way that's visible in browser devtools beyond what's unavoidable for a client-side app?
- Caching should have a clear invalidation story (TTL or manual refresh) — stale channel lists silently going out of date is worse than no caching.

## Testing / verification

- Deliberately break things (kill network mid-playback, revoke credentials, malform a response) and confirm the app degrades gracefully instead of crashing.
- Run a production build and manually inspect the bundle for anything credential-related that shouldn't be there.

## Definition of done

- The app survives common failure modes gracefully, has no credential-security red flags in the production build, and performs acceptably on both desktop and the LG TV.
