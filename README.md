# Blake Birthday — Dallas Stars Arena Reveal

A cinematic, arena-style birthday reveal built with Vite, React, TypeScript, DOM/CSS animation, Web Audio, and a Canvas hockey challenge.

The arena photo *is* the UI. Nothing is drawn on top as a fake scoreboard: the real center-hung board, its score strip, name ribbon, side strips and the ring LED boards in the photo are each driven as a display surface.

1. Wide shot of American Airlines Center, LED ring boards scrolling
2. Camera flies into the jumbotron — starting-lineup bumper
3. Wii Sports-style lineup: bobble-head players in a receding row, camera tracks down the line
4. TV-broadcast season highlights with sweeping wipes, big numbers and photos
5. GTA-style switch: pull out over the arena, then three hard cuts down onto the puck at center ice
6. Pixel-art arcade shootout — one goal wins (aim, hold to charge, release)
7. Snap back to the jumbotron — GOAL takes over every LED surface
8. Two physical tickets float up from the bottom — the opponent is named here for the first time
9. Photo collage + birthday note

## How the arena works

- `src/arena/geometry.ts` holds everything in **photo pixels** (the photo is 1920×1440): the corner quads of each real LED surface, and the camera shots (regions of the photo to frame).
- `ArenaSurface` projects a fixed-size box (e.g. 960×540 for the main screen) onto a quad with a `matrix3d` homography, so board content is authored like a normal 960×540 layout.
- `ArenaWorld` renders the photo at native size and moves one transform to frame a shot, clamped so the photo edge never shows on any aspect ratio.
- The main screen is composited like a photographed LED: soft focus, dimmed whites, green cast, pixel grid, noise, glare, vignette, feathered edges and a bloom layer (`.jumbo-screen`, `.jumbo-glass`, `.jumbo-bloom` in `arena.css`).
- Re-measuring surfaces: open `/?calibrate` to outline every surface.
- `npm run check` verifies the projection math, simulates thousands of shootout attempts to keep one goal in the 2–5 try range, and confirms the bonus puzzle has exactly one solution.
- Dev only: `/?stage=tickets` (add `&secret` to pre-unlock the bonus puzzle) (or `lineup`, `highlights`, `iceDive`, `shootout`, `goal`, `final`) jumps straight to a stage.

## Keeping the surprise

`opponent` / `opponentAbbr` in `src/config.ts` are only rendered on the ticket reveal and final screen. Before that, the away team is `???` and the in-game goalie wears a generic uniform. (The names still ship in the JS bundle, so a determined source-viewer could find them.)

## Shootout

- `src/game/shootout.ts` — rules, goalie AI (reaction delay, momentum, guess error, dive poses) and all tuning numbers. Each miss makes the goalie slower and worse at guessing.
- `src/game/pixelArt.ts` — sprite drawing (goalie, shooter, puck, net, crease, rink, goal lamp, crowd).
- `src/game/HockeyChallenge.tsx` — loop, input (mouse aims directly; touch drags the reticle; arrows + space work too), puck trail, screen shake, slow-motion winning shot.

## Bonus puzzle (optional)

Clicking the cat during the lineup unlocks a Stars-themed placement puzzle (one ★ per row, column and color; stars can't touch) on the final screen. It never interrupts the main flow. Edit `REGIONS` in `src/puzzle/starPuzzle.ts` to change it; `npm run check` fails if the layout stops having exactly one solution. Which lineup player is the trigger is set with `secret: true` in `src/config.ts`.

If you swap the arena photo, the quads and shots in `geometry.ts` must be re-measured for the new image.

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

Photos live in `public/photos/` and are referenced with `photo("name.jpg")` in `src/config.ts`. Add more by dropping files there and adding `lineup` / `memories` entries; use `fit: "contain"` for illustrations that must not be cropped. Highlights run one slide per memory.

The arena background (`public/arena/aac-interior.jpg`) is a real American Airlines Center interior photo from Wikimedia Commons, credited in-app and licensed CC BY 4.0.

## Typography

The CSS display stack starts with `Industry Inc` if it is installed/served by you, then falls back to the freely available Barlow Condensed. Tickets use Graduate (varsity) and Yellowtail (script) from Google Fonts. Do not commit commercial font files unless you have the appropriate web-font license.

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
