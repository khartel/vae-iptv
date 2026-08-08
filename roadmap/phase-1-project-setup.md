# Phase 1 — Project Setup

## Goal

Scaffold a clean, conventional React + TypeScript + Vite project with the tooling and structure the rest of the roadmap depends on. No IPTV logic yet.

## Prerequisites

- Phase 0 complete: CORS/format findings known (they may affect whether we add a `server/` folder placeholder now, even if unused).

## Tasks

1. Scaffold with Vite (`react-ts` template).
2. Configure TypeScript strict mode.
3. Install and configure Tailwind CSS.
4. Set up `.env` / `.env.example` with placeholder Xtream credential keys (`VITE_XTREAM_SERVER_URL`, `VITE_XTREAM_USERNAME`, `VITE_XTREAM_PASSWORD`), and ensure `.env` is gitignored.
5. Initialize Git repo; first commit.
6. Establish folder structure per the architecture doc: `src/components`, `src/pages`, `src/services`, `src/hooks`, `src/types`, `src/utils`, `src/layouts`, `src/app`.
7. Set up ESLint/Prettier conventions.

## Instructions for AI agents

- Do not add any Xtream API calls yet — this phase is pure scaffolding.
- Do not add a backend (`server/`) unless Phase 0 findings showed a hard CORS blocker; if so, note it here and flag it to the user before adding it.
- Explain each config file's purpose briefly as it's created (vite.config, tsconfig, tailwind.config) — the user wants to understand, not just receive files.
- Confirm `.env` is in `.gitignore` before the first commit; this is a hard requirement, not optional.

## Testing / verification

```bash
npm install
npm run dev
```

Expect: a default Vite+React page loads at `localhost:5173` with Tailwind base styles applying cleanly (no console errors).

## Risks

- Tailwind/Vite version mismatches causing build errors — pin versions if issues arise.
- `.env` accidentally committed — verify `git status` before every commit in this phase especially.

## Definition of done

- `npm run dev` runs cleanly, folder structure exists, `.env.example` documents required keys with placeholders, first Git commit made.
