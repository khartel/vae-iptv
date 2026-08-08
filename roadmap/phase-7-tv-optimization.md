# Phase 7 — TV Optimization (10-foot UI)

## Goal

Adapt the existing (mouse/keyboard-oriented) UI into a "10-foot" interface suitable for viewing from a couch and navigating with a remote — before porting to actual webOS in Phase 8.

## Prerequisites

- Phases 4–6 functionally complete on desktop browser.

## Tasks

1. Increase base typography/spacing scale for TV-distance readability.
2. Implement a focus-management system: every interactive element must be reachable and clearly highlighted via keyboard arrow-key navigation (this simulates remote D-pad behavior before real webOS input exists).
3. Define a consistent focus style (outline/scale/glow) applied app-wide, not per-component ad hoc.
4. Ensure navigation is fully usable without a mouse: category → channel grid → player, and back, via arrow keys + Enter/Escape only.
5. Performance pass: confirm channel switching and grid scrolling stay smooth (this matters more on TV hardware than desktop).

## Instructions for AI agents

- Build focus management as a reusable hook/utility (e.g., a `useFocusable` pattern or a small spatial-navigation library) rather than wiring `tabIndex`/keydown handlers ad hoc per component — Phase 8's remote input will hook into this same system.
- Test exclusively via keyboard during this phase; if arrow-key-only navigation feels awkward on a laptop, it will feel worse on an actual TV remote — fix it now, not in Phase 8.
- Don't yet integrate webOS-specific APIs here — this phase is browser-based simulation of TV constraints, Phase 8 is the real deployment.

## Testing / verification

- Full app walkthrough (login → browse → play → back → switch channel) using only Tab/Arrow keys/Enter/Escape, no mouse.

## Risks

- Spatial navigation (2D grids) is genuinely harder to get right than linear tab order — budget real time for this, it's not a trivial CSS pass.
- Retrofitting focus management onto components built without it in mind can require real refactoring — this is expected, not a sign something went wrong earlier.

## Definition of done

- The entire app is navigable and readable at TV viewing distance using only directional keys, with consistent, visible focus states throughout.
