import type { BirthdayConfig } from "./types";

const photo = (name: string) => `${import.meta.env.BASE_URL}photos/${name}`;

export const birthday: BirthdayConfig = {
  birthdayName: "Blake",
  partnerName: "Chase",
  venue: "American Airlines Center",
  venueAddress: ["2500 VICTORY AVENUE", "DALLAS, TEXAS 75219"],
  opponent: "Colorado Avalanche",
  homeTeam: "Dallas Stars",
  gameDay: "FRIDAY",
  gameDate: "JAN 22 2027",
  gameTime: "7:00 PM",
  // Surface/camera coordinates in src/arena/geometry.ts are measured on this exact photo.
  arenaImage: `${import.meta.env.BASE_URL}arena/aac-interior.jpg`,
  arenaCredit: {
    label: "American Airlines Center Interior 2026 Â· BullDawg2021",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:American_Airlines_Center_Interior_2026.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },

  // Add more photos: drop files in public/photos and add entries below.
  lineup: [
    { name: "BLAKE", number: "01", role: "BIRTHDAY CAPTAIN", image: photo("navasota.jpg"), imagePosition: "50% 30%" },
    { name: "CHASE", number: "02", role: "SECRET GENERAL MANAGER", image: photo("hackathon.jpg"), imagePosition: "50% 45%" },
    { name: "THE DUO", number: "24", role: "FIRST LINE CHEMISTRY", image: photo("duo.jpg"), imagePosition: "55% 40%" },
    { name: "THE PUP", number: "12", role: "HEAD OF MORALE", image: photo("dog.jpg"), imagePosition: "50% 35%" },
    { name: "THE CAT", number: "99", role: "ENFORCER (NAPS)", image: photo("cat.jpg"), imagePosition: "50% 45%" },
  ],

  memories: [
    { src: photo("navasota.jpg"), alt: "Blake asleep", caption: "Navasota — where the franchise started", position: "50% 35%" },
    { src: photo("hackathon.jpg"), alt: "Hacking at a hackathon", caption: "Two hackathons survived together", position: "50% 55%" },
    { src: photo("duo.jpg"), alt: "Blake and Chase in a crowd", caption: "Still the easiest person to choose", position: "50% 40%" },
    { src: photo("pets.jpg"), alt: "Pixel art of the dog and cat", caption: "Full roster photo", fit: "contain" },
    { src: photo("dog.jpg"), alt: "Pixel art dog", caption: "Scouting report: very good boy", fit: "contain" },
    { src: photo("cat.jpg"), alt: "Pixel art cat", caption: "Veteran presence in the locker room", fit: "contain" },
  ],

  stats: [
    { label: "FIRST MET", value: "NAVASOTA", detail: "The inaugural season." },
    { label: "HACKATHONS", value: "2", detail: "Undefeated in sleep deprivation." },
    { label: "STARTED TALKING", value: "JULY 9", detail: "Front office never recovered." },
    { label: "ROSTER SIZE", value: "2+2", detail: "Two humans. Two pets. Zero trades." },
    { label: "CHEMISTRY", value: "100", detail: "Scouts call it statistically suspicious." },
    { label: "BIRTHDAY", value: "LVL UP", detail: "Tonight's featured fan." },
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
