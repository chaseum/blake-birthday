# Blake Birthday — Dallas Stars Arena Reveal

A cinematic, arena-style birthday reveal built with Vite, React, TypeScript, DOM/CSS animation, Web Audio, and a Canvas hockey challenge.

The site is deliberately structured like an arena presentation rather than a normal webpage:

1. Wide American Airlines Center view with scrolling LED ribbon text
2. Jumbotron zoom
3. Wii-Sports-style starting-lineup camera pan
4. TV-broadcast season highlight package with relationship photos/stats
5. Fast camera dive from the jumbotron to the ice
6. Two-goal shootout challenge with a reacting Colorado goalie
7. Camera pullback to a full-jumbotron GOAL celebration
8. Two physical souvenir tickets rise into frame
9. Final photo collage + birthday note

## Local development

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm run preview
```

## Personalization

Most content is in `src/config.ts`:

- names
- matchup/date/time
- lineup
- relationship stats
- memory photos
- ticket section/row/seats
- final note

The current memory URLs reuse photos from the Valentine's Day repository so the prototype immediately has real photos. For the final version, copy the chosen photos into `public/photos/` and replace the URLs in `src/config.ts` so this project is self-contained.

The arena background is a real American Airlines Center interior photo from Wikimedia Commons. It is credited in-app and licensed CC BY 4.0. If you replace it, update `arenaImage` and `arenaCredit` in `src/config.ts`.

## Typography

The CSS display stack starts with `Industry Inc` if it is installed/served by you, then falls back to the freely available Barlow Condensed. Do not commit commercial font files unless you have the appropriate web-font license.

## Tickets

The ticket UI is a souvenir reveal and intentionally says `NOT VALID FOR ENTRY`. Update the real section, row, and seat numbers in `src/config.ts` once you want them shown.

The matchup is set to:

- Colorado Avalanche at Dallas Stars
- Friday, January 22, 2027
- 7:00 PM
- American Airlines Center

## Deploy

### Vercel

Import the GitHub repository. Vercel should detect Vite automatically.

- Build: `npm run build`
- Output: `dist`

### Cloudflare Pages

- Framework preset: React / Vite
- Build: `npm run build`
- Output: `dist`

No backend, database, redirects, or environment variables are required.
