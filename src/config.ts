import type { BirthdayConfig } from "./types";

const photo = (name: string) => `${import.meta.env.BASE_URL}photos/${name}`;

export const birthday: BirthdayConfig = {
  birthdayName: "Blake",
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
  arenaImage: `${import.meta.env.BASE_URL}arena/aac-interior.jpg`,
  arenaCredit: {
    label: "American Airlines Center Interior 2026 · BullDawg2021",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:American_Airlines_Center_Interior_2026.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },

  // Photos live in public/photos (web copies, metadata stripped). Originals: media-source/.
  // Exactly four players, shown Wii Sports-style in this order.
  lineup: [
    { name: "BLAKE", number: "01", role: "BIRTHDAY CAPTAIN", image: photo("navasota.jpg"), imagePosition: "50% 30%" },
    { name: "CHASE", number: "02", role: "SECRET GENERAL MANAGER", image: photo("hackathon.jpg"), imagePosition: "50% 45%" },
    { name: "THE DUO", number: "24", role: "FIRST LINE CHEMISTRY", image: photo("duo-selfie.jpg"), imagePosition: "50% 30%" },
    { name: "BLAKE'S DOG", number: "12", role: "HEAD OF MORALE", image: photo("dog.jpg"), imagePosition: "50% 35%" },
  ],

  // Rotates on the jumbotron fan cam before PLAY (stills only; no video before PLAY).
  fanCam: [
    { src: photo("navasota.jpg"), alt: "Asleep in Navasota", caption: "", position: "50% 35%" },
    { src: photo("asleep.jpg"), alt: "Asleep on a pillow", caption: "", position: "50% 40%" },
    { src: photo("lounge.jpg"), alt: "Lounging in a museum chair", caption: "", position: "50% 40%" },
    { src: photo("portrait.jpg"), alt: "Smiling portrait", caption: "", position: "50% 35%" },
    { src: photo("train.jpg"), alt: "Riding a train", caption: "", position: "50% 40%" },
    { src: photo("study.jpg"), alt: "Studying at a laptop", caption: "", position: "50% 35%" },
    { src: photo("facetime.jpg"), alt: "Video call screenshot", caption: "", position: "50% 35%" },
    { src: photo("duo.jpg"), alt: "Blake and Chase in a crowd", caption: "", position: "50% 40%" },
  ],

  // One highlight slide each; `video` clips play muted, only after PLAY.
  memories: [
    { src: photo("duo-selfie.jpg"), alt: "Blake and Chase selfie", caption: "Franchise cornerstones", position: "50% 35%" },
    { src: photo("museum-game.jpg"), video: photo("museum-game.mp4"), alt: "Playing a reaction game at the museum", caption: "Museum reaction test — new high score", position: "50% 28%", duration: 6000 },
    { src: photo("skyline.jpg"), alt: "Selfie in front of the city skyline", caption: "Downtown road trip", position: "50% 45%" },
    { src: photo("anime-matsuri.jpg"), alt: "Sword pose at Anime Matsuri", caption: "Anime Matsuri — sword drills", position: "55% 50%" },
    { src: photo("mirror.jpg"), alt: "Mirror selfie", caption: "Matching fit check", position: "50% 35%" },
    { src: photo("car-selfie.jpg"), alt: "Car selfie", caption: "Carpool lane", position: "50% 40%" },
    { src: photo("night-out.jpg"), alt: "Night out selfie", caption: "Night game energy", position: "50% 35%" },
    { src: photo("scouting-report.jpg"), alt: "Annotated close-up selfie", caption: "Scouting report: annotated", position: "50% 40%" },
    { src: photo("hackathon.jpg"), alt: "Hacking at a hackathon", caption: "Two hackathons survived together", position: "50% 55%" },
  ],

  // Paired with memories by index.
  stats: [
    { label: "FIRST MET", value: "NAVASOTA", detail: "The inaugural season." },
    { label: "REACTION TEST", value: "65", detail: "Personal best, museum division." },
    { label: "STARTED TALKING", value: "JULY 9", detail: "Front office never recovered." },
    { label: "SWORD DRILLS", value: "A+", detail: "Scouts were not prepared." },
    { label: "FIT CHECKS", value: "10/10", detail: "Coordinated. Allegedly by accident." },
    { label: "CHEMISTRY", value: "100", detail: "Scouts call it statistically suspicious." },
    { label: "LATE NIGHTS", value: "MANY", detail: "Zero regrets on record." },
    { label: "BIRTHDAY", value: "LVL UP", detail: "Tonight's featured fan." },
    { label: "HACKATHONS", value: "2", detail: "Undefeated in sleep deprivation." },
  ],

  // Replace these three fields once you want the real seat assignment shown.
  ticket: {
    section: "---",
    row: "---",
    seats: ["---", "---"],
  },

  note:
    "Happy birthday, my love. I wanted your present to feel like more than opening an envelope, so obviously I made you play hockey for it. I cannot wait to go watch the Stars with you. See you at puck drop <3",
};
