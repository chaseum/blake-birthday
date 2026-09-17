import type { BirthdayConfig } from "./types";

// `?.` keeps this importable from `npm run check` (plain Node has no import.meta.env).
const base = import.meta.env?.BASE_URL ?? "/";
const photo = (name: string) => `${base}photos/${name}`;
const AGE = 23;

export const birthday: BirthdayConfig = {
  birthdayName: "Blake",
  age: AGE,
  playerNumber: String(AGE),
  partnerName: "Chase",
  venue: "American Airlines Center",
  venueAddress: ["2500 VICTORY AVENUE", "DALLAS, TEXAS 75219"],
  opponent: "Colorado Avalanche",
  opponentAbbr: "COL",
  homeTeam: "Dallas Stars",
  gameDay: "FRIDAY",
  gameDate: "JAN 22 2027",
  gameTime: "7:00 PM",
  // Surface/camera coordinates in src/arena/geometry.ts are measured on this exact photo.
  arenaImage: `${base}arena/aac-interior.jpg`,
  arenaCredit: {
    label: "American Airlines Center Interior 2026 · BullDawg2021",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:American_Airlines_Center_Interior_2026.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },

  // Photos live in public/photos (optimized web copies, metadata stripped). Originals: media-source/.
  // `npm run check` fails if any local path below is missing.
  music: `${base}audio/canned-heat-8bit.mp3`,
  cues: {
    puckOff: `${base}audio/puck-off.mp3`,
    goalHorn: `${base}audio/goal-horn.mp3`,
  },

  // Exactly four players, shown Wii Sports-style in this order.
  lineup: [
    { name: "BLAKE", number: String(AGE), role: "BIRTHDAY CAPTAIN", image: photo("blake-dinner.jpg"), imagePosition: "42% 22%" },
    { name: "CHASE", number: "02", role: "BLAKE'S BIGGEST FAN", image: photo("chase-skyline.jpg"), imagePosition: "48% 42%" },
    { name: "THE DUO", number: "24", role: "FIRST LINE CHEMISTRY", image: photo("duo-selfie.jpg"), imagePosition: "50% 30%" },
    { name: "FRITZ", number: "12", role: "HEAD OF MORALE", image: photo("fritz.jpg"), imagePosition: "72% 55%" },
  ],

  // Rotates on the jumbotron fan cam before PLAY (stills only, all Blake; no video before PLAY).
  fanCam: [
    { src: photo("blake-treehouse.jpg"), alt: "Blake lounging by the window", caption: "", position: "60% 45%" },
    { src: photo("portrait.jpg"), alt: "Blake grinning at the camera", caption: "", position: "50% 40%" },
    { src: photo("asleep.jpg"), alt: "Blake asleep on a pillow", caption: "", position: "50% 40%" },
    { src: photo("lounge.jpg"), alt: "Blake lounging in a museum chair", caption: "", position: "50% 40%" },
    { src: photo("blake-cozy.jpg"), alt: "Blake's cozy grin", caption: "", position: "50% 30%" },
    { src: photo("study.jpg"), alt: "Blake studying at a laptop", caption: "", position: "50% 35%" },
    { src: photo("formal-night.jpg"), alt: "Blake dressed up for a formal night", caption: "", position: "82% 35%" },
    { src: photo("anime-matsuri.jpg"), alt: "Blake's sword pose at Anime Matsuri", caption: "", position: "70% 50%" },
  ],

  // Blake's season highlights, one slide each (keep it to ~6). `video` clips play muted, only after PLAY.
  memories: [
    { src: photo("train.jpg"), alt: "Blake on a train in Ireland", caption: "Blake takes the show to Ireland", position: "45% 40%" },
    // museum-game.mp4 is pre-cut to the payoff (IMG_8664.MOV 6.0s -> end, 7.0s long). The slide outlasts
    // the clip, so the final frame holds. `position` is only the visual framing, not the time crop.
    {
      src: photo("museum-game.jpg"),
      video: photo("museum-game.mp4"),
      alt: "Blake playing a reaction game at the Perot Museum",
      caption: "Perot reaction time test, you beat Chase!",
      position: "50% 55%",
      duration: 7600,
    },
    { src: photo("duo-wings.jpg"), alt: "Blake at the Wingstop World Cup watch party", caption: "Wingstop World Cup watch party, downtown", position: "35% 35%" },
    { src: photo("mirror.jpg"), alt: "Blake and Chase in matching outfits at IKEA", caption: "IKEA away day, fits matching (always)", position: "50% 35%" },
    { src: photo("night-out.jpg"), alt: "Blake in bunny ears at a frat party", caption: "Frat party, went to overtime", position: "40% 35%" },
    { src: photo("blake-cozy.jpg"), alt: "Close-up of Blake's new glasses, circled in red", caption: "New glasses, frames picked by Chase", position: "50% 40%" },
  ],

  // Stat card for each highlight, paired by index (same length; `npm run check` enforces it).
  stats: [
    { label: "IRELAND RUN", value: "AWAY", detail: "Blake took his game overseas." },
    { label: "REACTION TEST", value: "SCORE: 53", detail: "Beat Chase. No rematch granted." },
    { label: "WORLD CUP WATCH PARTY", value: "WINGS", detail: "Very overpriced drinks but free lineups (?)" },
    { label: "IKEA AWAY DAY", value: "MATCHED", detail: "Coordinated fits at all times." },
    { label: "FRAT PARTY", value: "OT", detail: "The DJ kept playing the same songs for some reason..." },
    { label: "NEW GLASSES ERA", value: "20/20", detail: "A$AP's glasses but they look fire on you king!" },
  ],

  // Final collage: strong Blake, an event, a candid, the two of them, and Fritz.
  finalPhotos: [
    { src: photo("blake-dinner.jpg"), alt: "", caption: "", position: "42% 25%" },
    { src: photo("duo-wings.jpg"), alt: "", caption: "", position: "40% 35%" },
    { src: photo("scouting-report.jpg"), alt: "", caption: "", position: "50% 40%" },
    { src: photo("skyline.jpg"), alt: "", caption: "", position: "45% 65%" },
    { src: photo("study.jpg"), alt: "", caption: "", position: "55% 15%" },
  ],

  // Replace these three fields once you want the real seat assignment shown.
  ticket: {
    section: "328",
    row: "P",
    seats: ["7", "8"],
  },

  note:
    "Happy birthday my handsome, funny, smart, beautiful, ravishing boyfriend!!! I wanted your present to feel a bit more interactive, so I made you work a lil bit for your tickets (by playing hockey obviously :3). I can't wait to go watch the Stars with you, but you're still the brightest star of them all <3. Happy 23rd!!! I love you to the moon and mars king!",
};
