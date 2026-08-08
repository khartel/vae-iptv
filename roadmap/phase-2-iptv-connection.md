# Phase 2 — IPTV Connection

## Goal

Build a typed service layer that talks to the Xtream Codes API: authentication and connection validation only. No UI beyond a minimal test harness.

## Prerequisites

- Phase 1 complete (project scaffolded).
- Phase 0 findings on response shape available to inform TypeScript types.

## Tasks

1. Define TypeScript types for: auth response (`user_info`, `server_info`), categories, streams (based on Phase 0 findings, using realistic but fake example fields until confirmed).
2. Build `src/services/xtreamApi.ts` (or similar): a typed fetch wrapper for `player_api.php` calls.
3. Implement `login()` / `validateConnection()` using credentials from `.env`.
4. Implement error handling: distinguish network failure, invalid credentials, and malformed response.
5. Add a minimal test harness (a temporary page or console log) to confirm login succeeds — not real UI yet.

## Instructions for AI agents

- Read credentials only from `import.meta.env.VITE_XTREAM_*`; never hard-code them, never log full credential values to console.
- Keep the service pure/testable: no React state inside `xtreamApi.ts`, just functions returning typed data or throwing typed errors.
- Explain the Xtream request/response structure using fake example data in conversation, consistent with Phase 0's real findings but with placeholder values.
- This phase ends before touching video playback or channel UI — resist the urge to jump ahead to Phase 3 work.

## Testing / verification

- Manually trigger `login()` with real local `.env` credentials and confirm a successful typed response in the console.
- Trigger with a deliberately wrong password to confirm the error path is caught and typed correctly.

## Risks

- Xtream error responses aren't always consistent JSON — some providers return HTML error pages instead. Handle non-JSON responses gracefully.
- Auth failures and network failures need different user-facing treatment later; keep them distinguishable now.

## Definition of done

- A typed `xtreamApi` service exists, successfully authenticates against the real provider using `.env` credentials, and handles at least the "wrong credentials" and "network unreachable" error cases distinctly.

## Findings (2026-08-08)

- **Invalid-credentials response shape (important, non-obvious)**: this provider returns a bare `{"user_info":{"auth":0}}` for a wrong password — `server_info` is entirely absent, not just empty. A strict type guard requiring the full `XtreamAuthResponse` shape misclassified this as a `parse` error instead of `auth`. Fixed by checking `user_info.auth` first (only requiring `user_info` to exist), and only validating the full shape (including `server_info`) once `auth === 1`. This ordering matters for any future Xtream response handling in this codebase — don't assume failure responses share the success response's shape.
- **Verified end-to-end in a real browser** (not just curl): built a temporary test harness in `App.tsx` that calls `login()` on mount, launched the actual Vite dev server, and drove it with headless Chromium (Playwright) to confirm both the success path (green "Auth succeeded" with real account data) and the fixed failure path (red "Login failed (auth)" with the correct message) render correctly with zero console errors. This is stronger evidence than a curl test alone, since it exercises the real `fetch()` call path a browser makes, including CORS and default User-Agent.
- Dev server port note: `5173`/`5174` were occupied by other local projects during testing; Vite auto-fell-back to `5175`. Not an app issue, just something to check with `cat` on the dev server's stdout if `localhost:5173` ever shows unexpected content.
