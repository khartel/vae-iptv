# Phase 0 — Research & Validation

## Goal

Before any project code exists, confirm the assumptions the whole architecture depends on: that the provider speaks standard Xtream Codes API, what stream container format it serves, whether the API is reachable directly from a browser (CORS), and what webOS's browser engine can realistically support. This phase produces _findings_, not code.

## Prerequisites

- Xtream Codes credentials (server URL, username, password) from the family's legitimate provider, known only to the user.

## Tasks

1. Confirm authentication works: call `player_api.php` with credentials and confirm a successful `user_info`/`server_info` response.
2. Confirm category/channel retrieval: call `get_live_categories` and `get_live_streams`, inspect the response shape.
3. Determine stream format: build one stream URL and inspect it — is it `.m3u8` (HLS) or a raw `.ts` (MPEG-TS) URL?
4. Check CORS: inspect response headers (`Access-Control-Allow-Origin`) on an API call made from a browser context (not curl, since curl ignores CORS).
5. Note webOS constraints: webOS version target, known HEVC/H.265 support gaps, Chromium engine version if determinable.

## Instructions for AI agents

- Never request that the user paste real credentials, full request/response bodies containing credentials, or screenshots containing them into the conversation.
- Give the user a command template with placeholders (`YOUR_SERVER_URL`, `YOUR_USERNAME`, `YOUR_PASSWORD`) to run **locally** themselves (curl, Postman, or browser devtools).
- Ask the user to report back only the _shape_ of what they saw: field names present, whether the stream extension was `.m3u8` or `.ts`, whether a CORS header was present, any error codes. Redacted/sanitized summaries are fine; raw credential-bearing output is not.
- Use findings to make concrete go/no-go calls for Phase 1–3 decisions (e.g., "CORS is blocked → we need a proxy sooner" or "streams are MPEG-TS → hls.js alone won't be enough").

## Testing / verification

- User confirms: auth succeeds, categories/channels return data, one working stream URL is identified, CORS header presence is known.

## Risks

- CORS blocked by provider → direct-from-browser architecture needs revisiting (Node proxy pulled forward).
- MPEG-TS-only streams → may need transmuxing or a backend remux step.
- HEVC-encoded streams → may not play on some browsers/TV models regardless of container.

## Definition of done

- We know: auth works, response shapes for categories/streams, stream container format, CORS status, and any early red flags for webOS playback.

## Findings (2026-08-08)

- **Auth**: confirmed working against the real provider. `player_api.php` returns `auth: 1`, `status: "Active"` for valid credentials.
- **Stream formats supported**: `allowed_output_formats` in the auth response lists both `m3u8` (HLS) and `ts` (MPEG-TS) — hls.js-based playback (Phase 3 plan) is viable.
- **`max_connections: "1"`**: this account allows only ONE simultaneous stream. Real constraint for Phase 3+ testing (don't test playback while the TV is in use) and for app design (always cleanly tear down the previous stream connection before starting a new one; don't leave zombie connections open on channel switch).
- **CORS**: confirmed working. The server dynamically reflects the request's `Origin` header back as `Access-Control-Allow-Origin` (tested with `Origin: http://localhost:5173`, got it back verbatim) and sets `Access-Control-Allow-Credentials: true`. This means direct browser → Xtream API calls work with no backend proxy needed — the originally planned zero-backend architecture for the MVP holds.
- **User-Agent filtering (important, non-obvious)**: the provider's nginx frontend resets connections from unrecognized User-Agent strings — specifically, curl's default UA (`curl/8.21.0`) gets a mid-request connection reset, while a browser-like UA (`Mozilla/5.0`) or player-like UA (`VLC/3.0.18 LibVLC/3.0.18`) succeeds. This did NOT block our CORS test using `Mozilla/5.0`, and real browsers always send a UA starting with `Mozilla/5.0`, so this is expected to be a non-issue for the actual React app (browsers control the UA header; JS can't override it, but the default browser UA already passes). Worth a quick sanity re-check in Phase 2/3 once real `fetch` calls are wired up, just to confirm this holds for the exact UA string Chrome sends.
- **Secondary endpoint available**: `server_info.https_port` is `25460` — an HTTPS variant of the API exists on a different port than the plain-HTTP one (port `80`) used for these tests. Not needed for local dev (Vite serves over `http://localhost`, so no mixed-content issue), but relevant later if the app is ever served over HTTPS (e.g., some webOS distribution paths) — mixed content would then require switching API calls to the `https_port`.
- **Not yet directly tested**: `get_live_categories` / `get_live_streams` response shape, and playing an actual stream URL end-to-end. Both are standard Xtream endpoints and low-risk given `player_api.php` behaved exactly per spec; will be exercised directly as part of Phase 2 and Phase 3 rather than repeated here.

## Go/no-go outcome

**Go.** No architecture changes needed — proceed to Phase 1 with the zero-backend, direct-browser-to-Xtream-API plan as originally designed.
