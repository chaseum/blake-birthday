# Dallas Stars Birthday Reveal

A small scene-based birthday website built with Vite, React, and TypeScript.

It intentionally avoids a dashboard layout, component libraries, Tailwind, glassmorphism,
admin controls, and a fake quiz flow. The experience is:

1. Arena cold open
2. Starting lineup
3. Relationship season highlights
4. Gift lock
5. Hockey shootout
6. Goal celebration
7. Game reveal
8. Souvenir ticket + birthday note

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Personalize it

Start with:

```text
src/config.ts
```

Edit the names, highlights, opponent, date, time, seats, and birthday note there.

Replace the placeholder images in:

```text
public/photos/
```

Keep the filenames the same, or change the paths in `src/config.ts`.

Recommended real photos:

```text
public/photos/blake.jpg
public/photos/chase.jpg
public/photos/us.jpg
```

Then update the three matching paths in `src/config.ts`.

## Deploy to Vercel

The repo is a standard Vite app and does not need a custom `vercel.json`.

### Git workflow

1. Push the project to GitHub.
2. In Vercel, create/import a project from that repository.
3. Vercel should detect Vite automatically.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

You can also use the Vercel CLI:

```bash
npm i -g vercel
vercel
vercel --prod
```

## Deploy to Cloudflare Pages

For Cloudflare Pages:

- Framework preset: React / Vite
- Build command: `npm run build`
- Build output directory: `dist`

Connect the GitHub repository in Workers & Pages and deploy.

Cloudflare currently recommends Workers for many new application projects, but this site is
fully static, so Pages remains a straightforward fit.

## Notes

- No server or database is required.
- All content ships as static assets.
- The goal sound is synthesized in the browser, so no copyrighted Dallas Stars audio is bundled.
- The shootout goalie uses Colorado colors so the user is not shooting on Dallas's own goalie.
