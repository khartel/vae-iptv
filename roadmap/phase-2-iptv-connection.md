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
