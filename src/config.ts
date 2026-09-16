import type { BirthdayConfig } from "./types";

const valentineAssets =
  "https://raw.githubusercontent.com/chaseum/valentines-day-website/main/assets";

/**
 * Personal content lives here. The presentation and game should not need edits
 * when you swap photos, jokes, seats, or matchup details.
 */
export const birthday: BirthdayConfig = {
  birthdayName: "Blake",
  partnerName: "Chase",
  venue: "American Airlines Center",
  opponent: "Colorado Avalanche",
  homeTeam: "Dallas Stars",
  gameDay: "FRIDAY",
  gameDate: "JAN 22 2027",
  gameTime: "7:00 PM",
  arenaImage:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/American_Airlines_Center_Interior_2026.jpg/1280px-American_Airlines_Center_Interior_2026.jpg",
  arenaCredit: {
    label: "American Airlines Center Interior 2026 · BullDawg2021",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:American_Airlines_Center_Interior_2026.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },

  lineup: [
    {
      name: "BLAKE",
      number: "01",
      role: "BIRTHDAY CAPTAIN",
      image: `${valentineAssets}/IMG_7447.JPG`,
      imagePosition: "50% 42%",
    },
    {
      name: "CHASE",
      number: "02",
      role: "SECRET GENERAL MANAGER",
      image: `${valentineAssets}/IMG_7448.JPG`,
      imagePosition: "50% 55%",
    },
    {
      name: "THE DUO",
      number: "24",
      role: "FIRST LINE CHEMISTRY",
      image: `${valentineAssets}/IMG_0667.JPEG`,
      imagePosition: "50% 34%",
    },
    {
      name: "THE BENCH",
      number: "∞",
      role: "ELITE MORAL SUPPORT",
      image: `${valentineAssets}/me-and-blake-pets.png`,
      imagePosition: "50% 50%",
    },
  ],

  memories: [
    {
      src: `${valentineAssets}/IMG_7447.JPG`,
      alt: "Blake and Chase together",
      caption: "Navasota — where the franchise started",
      position: "50% 38%",
    },
    {
      src: `${valentineAssets}/IMG_7448.JPG`,
      alt: "Blake and Chase at a hackathon",
      caption: "Two hackathons survived together",
      position: "50% 58%",
    },
    {
      src: `${valentineAssets}/IMG_0667.JPEG`,
      alt: "Blake and Chase together",
      caption: "Still the easiest person to choose",
      position: "50% 32%",
    },
    {
      src: `${valentineAssets}/me-and-blake-pets.png`,
      alt: "Blake and Chase with their pets",
      caption: "Full roster photo",
      position: "50% 50%",
    },
  ],

  stats: [
    {
      label: "FIRST MET",
      value: "NAVASOTA",
      detail: "The inaugural season.",
    },
    {
      label: "STARTED TALKING",
      value: "JULY 9",
      detail: "Front office never recovered.",
    },
    {
      label: "HACKATHONS",
      value: "2",
      detail: "Undefeated in sleep deprivation.",
    },
    {
      label: "CHEMISTRY",
      value: "100",
      detail: "Scouts call it statistically suspicious.",
    },
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
