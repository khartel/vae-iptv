# IPTV Player — Development Roadmap

This folder is the source of truth for how this project gets built, phase by phase. It exists so that any AI agent (or future you) picking up this project mid-stream has full context without re-deriving the plan from scratch.

## How to use these files

- Work through phases **in order**. Do not start Phase N+1 until Phase N's "Definition of done" is met.
- Each phase file has the same structure: Goal, Prerequisites, Tasks, Instructions for AI agents, Testing/verification, Risks, Definition of done.
- The "Instructions for AI agents" section in each file is written as a direct brief to whichever AI is implementing that phase — follow it literally.
- Never hard-code real IPTV credentials anywhere in this repo, including in these markdown files. Use placeholders (`YOUR_SERVER_URL`, `YOUR_USERNAME`, `YOUR_PASSWORD`).

## Phase index

| Phase | File                                                               | Status                                                  |
| ----- | ------------------------------------------------------------------ | ------------------------------------------------------- |
| 0     | [phase-0-research-validation.md](phase-0-research-validation.md)   | Complete                                                |
| 1     | [phase-1-project-setup.md](phase-1-project-setup.md)               | Complete                                                |
| 2     | [phase-2-iptv-connection.md](phase-2-iptv-connection.md)           | Complete                                                |
| 3     | [phase-3-first-stream.md](phase-3-first-stream.md)                 | Code complete, playback unverified (see phase file)     |
| 4     | [phase-4-live-tv-interface.md](phase-4-live-tv-interface.md)       | Complete (see Status note — real design system adopted) |
| 5     | [phase-5-epg.md](phase-5-epg.md)                                   | Complete                                                |
| 6     | [phase-6-movies-series.md](phase-6-movies-series.md)               | Up next                                                 |
| 7     | [phase-7-tv-optimization.md](phase-7-tv-optimization.md)           | Not started                                             |
| 8     | [phase-8-lg-webos.md](phase-8-lg-webos.md)                         | Not started                                             |
| 9     | [phase-9-production-hardening.md](phase-9-production-hardening.md) | Not started                                             |

## Non-negotiable ground rules (apply to every phase)

1. This is a client for a legitimately authorized IPTV subscription. Never implement or suggest bypassing authentication, DRM, geo-restriction, or subscription checks.
2. Never ask the user to paste real credentials into a conversation. Use `.env` locally and placeholders everywhere else.
3. Work one phase at a time. Do not skip ahead or pre-build later-phase features "while we're in there."
4. Explain what/why/how/where-it-fits/how-to-test/what-could-go-wrong for every non-trivial piece of code — the user wants to understand the engineering, not just receive working code.
5. Prefer the smallest thing that proves the phase's goal. Polish comes in Phase 7 and Phase 9, not earlier.
