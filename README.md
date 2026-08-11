# VAE IPTV

A personal IPTV player client for the Xtream Codes API, built with React, TypeScript, and Vite. Designed as a 10-foot TV interface — full keyboard/remote spatial navigation, live TV with EPG, movies and series with resume/continue-watching, and packaging for LG webOS TVs.

This is a client for a legitimately authorized IPTV subscription. It talks directly to your own provider's Xtream Codes API — no bypassing of authentication, DRM, or subscription checks.

## Features

- **Live TV** — category browsing, channel grid, EPG (current/next program), favorites, channel skip.
- **Movies & Series** — category browsing, details pages, season/episode navigation, resume playback.
- **Home** — quick-launch tiles, Continue Watching (real per-title progress), genre-based Recommended for You.
- **Search** — client-side search across live channels, movies, and series.
- **Custom video player** — seek bar, skip ±10s, volume, mute, fullscreen, all keyboard/remote-focusable (see [src/components/VodPlayerChrome.tsx](src/components/VodPlayerChrome.tsx)).
- **10-foot UI** — large typography, one consistent focus style, full arrow-key/remote navigation via [@noriginmedia/norigin-spatial-navigation](https://github.com/NoriginMedia/Norigin-Spatial-Navigation) (see [src/lib/spatialNav.ts](src/lib/spatialNav.ts)).
- **LG webOS packaging** — builds and packages into a `.ipk` for installation on a real LG TV via Developer Mode.

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7 (HashRouter), Framer Motion, hls.js, lucide-react icons.

## Getting started

```bash
npm install
cp .env.example .env   # fill in your real Xtream Codes credentials
npm run dev
```

`.env` holds your Xtream Codes server URL, username, and password (`VITE_XTREAM_*`). It's gitignored — never commit real credentials. See `.env.example`.

## Scripts

| Script                  | Purpose                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server                                     |
| `npm run build`         | Typecheck (`tsc -b`) and build a production bundle to `dist/` |
| `npm run preview`       | Serve the production build locally                            |
| `npm run lint`          | Lint with oxlint                                              |
| `npm run format`        | Format with Prettier                                          |
| `npm run format:check`  | Check formatting without writing                              |
| `npm run package:webos` | Build, then package `dist/` into a webOS `.ipk` (see below)   |

## Project structure

```
src/
  app/         AuthContext — login/session state
  pages/       Route-level screens (Home, Live TV, Movies, Series, Player, ...)
  components/  Shared UI (cards, video player + chrome, sidebar, etc.)
  hooks/       Data fetching + spatial-nav/back-navigation utilities
  lib/         Spatial nav init, watch-progress persistence (localStorage)
  services/    Xtream Codes API client
  types/       Xtream API response types
roadmap/       Phase-by-phase development plan and status (see roadmap/README.md)
webos-meta/    appinfo.json + icons for the webOS package
scripts/       Build helper scripts (webOS manifest copy)
```

## LG webOS deployment

The app packages as a webOS "Web App" — the existing web build running inside the TV's bundled Chromium webview, described by `webos-meta/appinfo.json`.

1. Install the webOS TV CLI: `npm install -g @webosose/ares-cli`
2. On the TV: install the **Developer Mode** app (LG Content Store), turn on Dev Mode Status and Key Server, and note the IP address + passphrase shown.
3. Pair the CLI with the TV:
   ```bash
   ares-setup-device --add <name> --info '{"host":"<TV_IP>","port":"9922","username":"prisoner","password":"<passphrase>"}'
   ```
   (The Developer Mode passphrase is an SSH **password**, not a key-decryption passphrase — those are different fields in `ares-setup-device`.)
4. Build, package, install, and launch:
   ```bash
   npm run package:webos
   ares-install --device <name> webos-out/com.vaeiptv.app_1.0.0_all.ipk
   ares-launch --device <name> com.vaeiptv.app
   ```
5. Debug on-device with `ares-inspect --device <name> com.vaeiptv.app` for remote Chrome DevTools.

Developer Mode sessions typically expire after ~50 hours and need re-enabling from the TV.

## Roadmap

Development proceeds phase by phase — see [roadmap/README.md](roadmap/README.md) for the full plan and current status of each phase.
