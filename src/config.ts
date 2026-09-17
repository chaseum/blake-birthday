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

  // Exactly four players, shown Wii Sports-style in this order.
  lineup: [
    { name: "BLAKE", number: String(AGE), role: "BIRTHDAY CAPTAIN", image: photo("blake-dinner.jpg"), imagePosition: "42% 22%" },
    { name: "CHASE", number: "02", role: "SECRET GENERAL MANAGER", image: photo("chase-skyline.jpg"), imagePosition: "48% 42%" },
    { name: "THE DUO", number: "24", role: "FIRST LINE CHEMISTRY", image: photo("duo-wings.jpg"), imagePosition: "45% 30%" },
    { name: "FRITZ", number: "12", role: "HEAD OF MORALE", image: photo("fritz.jpg"), imagePosition: "72% 55%" },
  ],

  // Rotates on the jumbotron fan cam before PLAY (stills only; no video before PLAY).
  fanCam: [
    { src: photo("blake-treehouse.jpg"), alt: "Lounging by the window", caption: "", position: "60% 45%" },
    { src: photo("asleep.jpg"), alt: "Asleep on a pillow", caption: "", position: "50% 40%" },
    { src: photo("portrait.jpg"), alt: "Smiling portrait", caption: "", position: "50% 40%" },
    { src: photo("lounge.jpg"), alt: "Lounging in a museum chair", caption: "", position: "50% 40%" },
    { src: photo("blake-cozy.jpg"), alt: "Cozy grin", caption: "", position: "50% 30%" },
    { src: photo("train.jpg"), alt: "Riding a train", caption: "", position: "50% 40%" },
    { src: photo("night-out.jpg"), alt: "Night out selfie", caption: "", position: "50% 35%" },
    { src: photo("study.jpg"), alt: "Studying at a laptop", caption: "", position: "50% 35%" },
    { src: photo("car-selfie.jpg"), alt: "Car selfie", caption: "", position: "50% 40%" },
  ],

  // One highlight slide each (keep it to ~6); `video` clips play muted, only after PLAY.
  memories: [
    { src: photo("duo-selfie.jpg"), alt: "Blake and Chase selfie", caption: "Franchise cornerstones", position: "50% 35%" },
    // museum-game.mp4 is pre-cut to the payoff (IMG_8664.MOV 6.0s -> end, 7.0s long). The slide outlasts
    // the clip, so the final frame holds. `position` is only the visual framing, not the time crop.
    {
      src: photo("museum-game.jpg"),
      video: photo("museum-game.mp4"),
      alt: "Playing a reaction game at the museum",
      caption: "Museum reaction test — new high score",
      position: "50% 55%",
      duration: 7600,
    },
    { src: photo("skyline.jpg"), alt: "Selfie in front of the city skyline", caption: "Downtown road trip", position: "50% 60%" },
    { src: photo("anime-matsuri.jpg"), alt: "Sword pose at Anime Matsuri", caption: "Anime Matsuri — sword drills", position: "55% 50%" },
    { src: photo("mirror.jpg"), alt: "Mirror selfie", caption: "Matching fit check", position: "50% 35%" },
    { src: photo("formal-night.jpg"), alt: "Dressed up for a formal night", caption: "Suited up for the big night", position: "70% 35%" },
  ],

  // Paired with memories by index (same length; `npm run check` enforces it).
  stats: [
    { label: "FIRST MET", value: "NAVASOTA", detail: "The inaugural season." },
    { label: "REACTION TEST", value: "65", detail: "Personal best, museum division." },
    { label: "STARTED TALKING", value: "JULY 9", detail: "Front office never recovered." },
    { label: "SWORD DRILLS", value: "A+", detail: "Scouts were not prepared." },
    { label: "FIT CHECKS", value: "10/10", detail: "Coordinated. Allegedly by accident." },
    { label: "NOW LEVEL", value: String(AGE), detail: "Tonight's featured fan." },
  ],

  // Final collage: a strong Blake, one together, one event, one candid.
  finalPhotos: [
    { src: photo("blake-cozy.jpg"), alt: "", caption: "", position: "50% 30%" },
    { src: photo("skyline.jpg"), alt: "", caption: "", position: "45% 65%" },
    { src: photo("anime-matsuri.jpg"), alt: "", caption: "", position: "55% 50%" },
    { src: photo("scouting-report.jpg"), alt: "", caption: "", position: "50% 40%" },
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
