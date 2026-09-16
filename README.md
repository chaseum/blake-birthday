# Blake Birthday â€” Dallas Stars Arena Reveal

A cinematic, arena-style birthday reveal built with Vite, React, TypeScript, DOM/CSS animation, Web Audio, and a Canvas hockey challenge.

The arena photo *is* the UI. Nothing is drawn on top as a fake scoreboard: the real center-hung board, its score strip, name ribbon, side strips and the ring LED boards in the photo are each driven as a display surface.

1. Wide shot of American Airlines Center, LED ring boards scrolling
2. Camera flies into the jumbotron — starting-lineup bumper
3. Wii Sports-style lineup: bobble-head players in a receding row, camera tracks down the line
4. TV-broadcast season highlights with sweeping wipes, big numbers and photos
5. GTA-style switch: pull out over the arena, then three hard cuts down onto the puck at center ice
6. Two-goal shootout (grab anywhere, pull back or flick)
7. Snap back to the jumbotron — GOAL takes over every LED surface
8. Two physical tickets float up from the bottom
9. Photo collage + birthday note

## How the arena works

- `src/arena/geometry.ts` holds everything in **photo pixels** (the photo is 1920×1440): the corner quads of each real LED surface, and the camera shots (regions of the photo to frame).
- `ArenaSurface` projects a fixed-size box (e.g. 960×540 for the main screen) onto a quad with a `matrix3d` homography, so board content is authored like a normal 960×540 layout.
- `ArenaWorld` renders the photo at native size and moves one transform to frame a shot, clamped so the photo edge never shows on any aspect ratio.
- Re-measuring surfaces: open `/?calibrate` to outline every surface. `npm run check` verifies the projection math.
- Dev only: `/?stage=tickets` (or `lineup`, `highlights`, `iceDive`, `shootout`, `goal`, `final`) jumps straight to a stage.

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
