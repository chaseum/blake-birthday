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
- Every visible LED face is its own quad: `mainFront`, `scoreStripFront`, `tickerFront`, the two pillars, the scoreboard's `leftFace` and `leftFaceTicker` (the right face is hidden from this camera), plus 16 bowl ribbon runs that follow the real physical breaks. Sponsor placards (RYSE, paylocity, Mustang Club / TexasFord) and structure are deliberately left untouched; `geometry.ts` lists them.
- Calibration: open `/?calibrate`. Every quad gets its own color, name and TL/TR/BR/BL markers with coordinates; screen effects are switched off; buttons set content opacity (0/25/50/100%) and jump the camera to wide / jumbotron / tight / board edges / each bowl.
- `npm run check` verifies the projection math, simulates thousands of shootout attempts to keep one goal in the 2–5 try range, validates media paths/content, and checks Meowdoku.
- Dev only: `/?stage=tickets` (or `lineup`, `highlights`, `iceDive`, `shootout`, `goal`, `final`) jumps straight to a stage.

## Media

- `public/` holds deployment-ready assets only: `photos/*.jpg` are optimized web copies (≤1800 px, JPEG q82, all metadata incl. GPS stripped), `audio/canned-heat-8bit.mp3` is the background track.
- Originals (HEIC, DNG, full-size JPG/PNG, the `.MOV`) live in `media-source/` and are never referenced at runtime. `media-source/private/` is git-ignored for documents that must never ship.
- `museum-game.mp4` is re-encoded from `IMG_8664.MOV` **6.0 s → end** (7.0 s, no audio) so it opens right before the payoff; the slide runs 7.6 s and holds the last frame. Framing is separate (`position` in config).
- Clips play muted, inline, without controls — only after PLAY.
- `npm run check` fails with the exact path if any configured image, poster, video or audio file is missing, or if a HEIC/DNG/MOV is referenced.
- Selection is by purpose in `src/config.ts`: `lineup`, `fanCam`, `memories` (highlights, 5–6 slides, paired with `stats`) and `finalPhotos` (collage).

## Audio

`src/audio/AudioDirector.ts` owns one AudioContext with music / ambience / SFX buses plus two stage cues:

- `public/audio/canned-heat-8bit.mp3`: background bed, looped.
- `public/audio/puck-off.mp3`: hype cue for the lineup intro and lineup (starts at 2.7 s, after the file's silence), then brought back from 30 s for the dive into the shootout. The bed drops out while it plays.
- `public/audio/goal-horn.mp3`: the real Dallas goal horn, started from 0.7 s the instant the goal goes in. It leads the goal stage (music at 0), carries on under the tickets and fades out for the final note.

Each stage has its own mix (`MIX`), and every change is a gain ramp. Cues start at `CUE_START` and pause once they have faded out. Meowdoku ducks everything except SFX while it is open. The ambience bus carries a crowd murmur and a low building rumble, plus randomly panned one-shots chosen per stage: skate carves, stick taps, puck slides, puck into the boards with a glass rattle, a rare distant whistle and crowd swells. `src/audio/arenaAudio.ts` holds the synthesized SFX (stings, wipes, puck, post, save, crowd roar, ticket flutter, meows).

## Easter egg

A tiny cat sits by the far boards on the opening shot. Clicking it opens **Meowdoku** (`src/components/Meowdoku.tsx`, rules in `src/puzzle/meowdoku.ts`): one cat per row, column and region, no touching. It plays like LinkedIn Queens: tap cycles empty → ✕ → cat → empty, and dragging (mouse or touch) marks empty cells ✕ without ever placing a cat. It is optional and never affects the birthday flow; `npm run check` verifies the layout has exactly one solution.

## Keeping the surprise

`opponent` / `opponentAbbr` in `src/config.ts` are only rendered on the ticket reveal and final screen. Before that, the away team is `???` and the in-game goalie wears a generic uniform. (The names still ship in the JS bundle, so a determined source-viewer could find them.)

## Shootout

- `src/game/shootout.ts` — rules, goalie AI (reaction delay, momentum, guess error, dive poses) and all tuning numbers. Each miss makes the goalie slower and worse at guessing.
- `src/game/pixelArt.ts` — sprite drawing (goalie, shooter, puck, net, crease, rink, goal lamp, crowd).
- `src/game/HockeyChallenge.tsx` — loop, input (mouse aims directly; touch drags the reticle; arrows + space work too), puck trail, screen shake, slow-motion winning shot.

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

Photos live in `public/photos/` and are referenced with `photo("name.jpg")` in `src/config.ts`. Add more by putting an optimized copy there and referencing it from `lineup` / `fanCam` / `memories` / `finalPhotos`; use `fit: "contain"` for illustrations that must not be cropped. Highlights run one slide per memory. Blake's age and jersey number come from `age` / `playerNumber`.

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
