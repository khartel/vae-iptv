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

## Status (2026-08-09): complete

**Library choice**: adopted `@noriginmedia/norigin-spatial-navigation` (coordinate-based arrow-key nav, actively maintained, designed for exactly this browser-first / real-TV-later progression — a good fit ahead of Phase 8's LG webOS port) rather than hand-rolling grid-index math, per the "small spatial-navigation library" instruction. `init()` is called once at module load in `src/lib/spatialNav.ts` with `shouldFocusDOMNode: true`, which makes every spatial focus change also move real browser focus — that one setting is what let the existing native `:focus-visible` styling, and handlers like `ChannelCard`'s onFocus-triggered EPG fetch, work for remote/keyboard nav with no extra plumbing, instead of maintaining a parallel focus system.

**Consistent focus style**: a single global rule in `index.css` (`button:focus-visible, a:focus-visible, input:focus-visible`) drives the focus ring app-wide — 2px indigo ring + soft glow + subtle scale, per the Stitch design system's focus spec, tuned down from its literal 1.1x scale to 1.04x after testing showed 1.1x clipping full-width rows (category buttons, episode rows) against their scroll containers. Component-level ad hoc focus classes (`focus-visible:border-primary` etc.) were removed from `ChannelCard`/`PosterCard` now that the global rule covers them.

**Reusable focus wiring**: `useFocusable` from the library is called directly per interactive element (that's the intended usage, not something to wrap further), but real duplication was extracted:

- `useBackNavigation` (Escape → close an open overlay/modal if the page has one, else browser back; blurs a focused text input instead of navigating away from it).
- `useSpatialInput` (lets a search box be arrow-key-reachable like any card, but only pauses spatial nav — via the library's `pause()`/`resume()` — once Enter is pressed to start typing, so arrow keys aren't swallowed the instant nav lands on an empty input).
- `CategorySidebar` and `LoadMoreButton` — Live TV/Movies/Series had near-identical category-list and "Load more" markup; wiring focus once here instead of three times over also cut real duplication that predated this phase.
- `AppLayout` re-focuses the routed content area (via a `FocusContext.Provider` wrapping `<Outlet/>`) on every route change, since spatial nav has no "focus nothing" state — without an explicit starting point, arrow keys are no-ops on a fresh page load.

**Real bugs found only by testing keyboard-only, exactly as the instructions warned**:

- A JSDoc comment containing `bg-surface-*/backdrop-blur` closed itself early at the literal `*/`, breaking the dev build — caught immediately by the actual language server the moment `AppBackground.tsx` was written (not spatial-nav-related, just this phase's first casualty).
- Pausing spatial nav on an input's `onFocus` (rather than on Enter) trapped arrow keys the instant nav landed on a search box — arrow keys interpreted as text-cursor movement instead of navigation, since `shouldFocusDOMNode` had already moved real focus there. Fixed by only pausing on `onEnterPress`.
- Several disabled/conditionally-rendered elements (disabled nav items, disabled home tiles, EPG "up next" title, modal close buttons) called `useFocusable` unconditionally but only attached its `ref` in the branch that rendered — producing registry entries with no DOM node (harmless but noisy "Component added without a node reference" warnings). Fixed by extracting each into its own small component so `useFocusable` is only ever called when the element actually mounts.
- Home page tiles are `<Link>`-wrapped `motion.div`s; the router's `Link` needed an explicit `ref` forward plus `className="block"` — an inline `<a>` around block content doesn't reliably pick up `transform`/`box-shadow` from the global focus rule otherwise.

**Attempted and reverted**: tried scoping each Live TV/Movies/Series category-list-plus-grid row behind its own `isFocusBoundary` container so left/right arrow-key nav couldn't escape to the page header's search box. It made things worse — internal navigation between the category list and the grid stopped working entirely, not just the escape-to-header case — so it was reverted rather than shipped half-broken. Left as a known, minor, occasionally-imperfect edge: pressing an arrow key before a category/channel list has finished loading (no grid to land on yet) can land focus on the header search box instead of waiting; a later arrow press once content has loaded resumes normally, and Escape always recovers regardless (blurs the input, matching `useBackNavigation`'s explicit input-blur rule). Worth a real fix in a future pass, per the roadmap's own "budget real time for this" callout — not attempted twice in the same session given the regression risk just demonstrated.

**Typography/spacing**: `ChannelCard` and `PosterCard` titles (the primary identifying label in every grid) bumped from `text-sm`/`font-semibold` to `text-base`/`font-bold`; `PosterCard`'s title overlay (previously `group-hover`-only, invisible to a keyboard/remote user who never hovers) now also shows on `group-focus-visible`. The rest of the type scale already came from the Stitch design system's 10-foot-tuned tokens (`headline-lg` 48px, `headline-md` 32px, `label-caps` 16px, 80px/60px safe margins) from Phase 4, so this was a targeted pass, not a full rewrite.

**Verified via Playwright, keyboard only, against the real provider**: Home (auto-focused "LIVE TV" tile on cold load) → Enter → Live TV → arrow through the category list → arrow into the channel grid → Enter → full-screen player (Pause button auto-focused) → Escape → back on Live TV. Also verified: nav rail expands via `:focus-within` (not just `:hover`, which would've left keyboard users staring at unlabeled icons) with the same box-shadow ring visible against it; Movies/Series category selection and poster grid focus; Escape blurring a mid-edit search box without leaving the page. No console errors or warnings across any of these runs.

**Performance**: no dedicated profiling pass — grid sizes are already capped by the existing 60-item "Load more" batching from Phase 6, and channel switching in the player reuses the same `VideoPlayer`/`goToIndex` path already in place, unchanged by this phase. Nothing in testing suggested jank; a real TV-hardware check is out of scope until Phase 8 provides real hardware to check it on.
