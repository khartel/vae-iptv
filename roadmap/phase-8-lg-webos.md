# Phase 8 — LG webOS Deployment

## Goal

Package and run the existing React app as a real webOS TV application on the user's LG TV, adapting only what's genuinely TV-specific — not rewriting the app.

## Prerequisites

- Phase 7 complete (10-foot UI + keyboard-simulated remote navigation working).

## Tasks

1. Explain webOS app fundamentals: a webOS "Web App" is essentially the existing web build running inside a bundled Chromium webview, described by an `appinfo.json` manifest.
2. Install LG's `webOS TV CLI` tooling (`ares-*` commands) and the webOS SDK.
3. Enable Developer Mode on the target LG TV (via the Developer Mode app from LG Content Store) and pair it with the CLI over the local network.
4. Build the existing Vite app for production and wrap it into a webOS `.ipk` package with `ares-package`.
5. Install to the TV with `ares-install` and launch with `ares-launch`; iterate using `ares-inspect` for remote Chromium devtools debugging on-device.
6. Wire real remote-control key events (arrow keys/Enter/Back map to standard `KeyboardEvent` codes on webOS) into the Phase 7 focus-management system — confirm it "just works" since it was already keyboard-driven.
7. Compatibility pass: verify HLS playback, codec support, and performance on the actual TV hardware (not just Chrome DevTools device emulation).

## Instructions for AI agents

- Do not assume feature parity with desktop Chrome — webOS's embedded browser engine version varies by TV model/firmware year and can lag significantly behind desktop Chrome.
- Treat this phase as _packaging and validation_, not a rewrite — if Phase 7's focus system needs app logic changes to work on-device, that's a signal Phase 7 wasn't actually input-agnostic and should be fixed at the root, not patched over with webOS-specific hacks.
- Publishing to the LG Content Store is out of scope unless the user asks — Developer Mode installation is sufficient and appropriate for a personal-use app, and Developer Mode has a known device time-limit (typically 50 hours before requiring re-enable) worth flagging to the user.
- Flag any playback failures that only reproduce on-device (not in desktop Chrome) clearly — these are usually codec/hardware-decoder limitations, not app bugs, and the fix may be "avoid that stream profile" rather than a code change.

## Testing / verification

- App installs and launches on the real LG TV via Developer Mode.
- Full remote-control walkthrough: browse, search, select, play, back — using the actual LG remote, not a keyboard.
- At least one real authorized channel plays back successfully on the TV.

## Risks

- HEVC/H.265 or other codec gaps on specific TV models/firmware.
- Developer Mode session time limits interrupting testing.
- webOS Chromium version behind desktop Chrome, causing subtle JS/CSS behavior differences.
- Network pairing (CLI ↔ TV) issues on some router/firewall configurations.

## Definition of done

- The app runs on the real LG TV via Developer Mode, is fully navigable with the physical remote, and plays at least one authorized live channel successfully.

## Status (2026-08-11): in progress — blocked on device pairing

**Tooling**: `@webosose/ares-cli` (npm, v2.4.0) installed globally — `ares-package`, `ares-install`, `ares-launch`, `ares-inspect`, `ares-setup-device` all on PATH. No separate webOS SDK/IDE install was needed; the npm CLI package is self-contained.

**App adapted for packaging** (the "genuinely TV-specific" changes, not a rewrite):

- `BrowserRouter` → `HashRouter` in `src/App.tsx` — a packaged webOS app has no server to rewrite deep links back to `index.html`, so hash-based routing is the standard fix for embedded/file-served web apps.
- `vite.config.ts` sets `base: './'` — the webOS app host doesn't serve `index.html` from a domain root, so absolute `/assets/...` URLs would 404 on-device even though they work fine from the Vite dev server.
- `useBackNavigation` now also treats the LG remote's hardware Back button (keyCode 461 / `key === 'GoBack'`) the same as Escape. `webos-meta/appinfo.json` sets `"disableBackHistoryAPI": true` so webOS delivers Back as a plain keydown to the page instead of silently navigating browser history itself — confirming Phase 7's focus system needed no changes to handle it, just one more key alongside Escape in the same hook (per this phase's "if Phase 7 needs app logic changes, fix it at the root" instruction).
- Added `webos-meta/appinfo.json` (id `com.vaeiptv.app`) plus `icon.png`/`largeIcon.png` generated from the existing favicon, and a `package:webos` npm script (`scripts/copy-webos-meta.mjs`) that builds, copies the manifest/icons into `dist/`, then runs `ares-package`.
- `ares-package` required `--no-minify`: its bundled `uglify-js` (ES5-only parser) can't parse the modern syntax already present in Vite's own minified output, and failed with "Failed to minify code" until minification was skipped on its end.

**Verified so far** (all without the TV): production build renders correctly and error-free when served standalone (`vite preview`) — confirms the router/base-path changes didn't break anything. `ares-package -I` confirms the produced `.ipk` has a valid manifest.

**Blocked on**: pairing the CLI with the actual TV. `ares-setup-device` + `ares-install` currently fail with `All configured authentication methods failed` over SSH (port 9922, user `prisoner`) using the passphrase from the TV's Developer Mode → Key Server screen. One real bug already found and fixed along the way: the Developer Mode passphrase is an SSH **password** (`ares-setup-device`'s `password` field), not a key-decryption **passphrase** (a same-named but different field, only relevant when using `"auth_type": "ssh key"` with a local encrypted keyfile) — confirmed by reading `bin/ares-setup-device.js`'s interactive prompt logic. After correcting the field, auth still fails, so something else is wrong — candidates not yet ruled out: Dev Mode Status (the main toggle, separate from Key Server) not actually on, a mis-transcribed passphrase character, or the passphrase having rotated. Not yet resumed.

**Not yet done**: actual device pairing, `ares-install`, `ares-launch`, on-device remote-control walkthrough, real playback verification on TV hardware, `ares-inspect` on-device debugging.
