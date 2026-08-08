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
