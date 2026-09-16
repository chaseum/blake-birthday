import type { BirthdayConfig } from "./types";

/**
 * Edit this file first.
 *
 * Everything personal is kept here so the site logic does not become
 * a pile of hard-coded strings.
 */
export const birthday: BirthdayConfig = {
  birthdayName: "Blake",
  partnerName: "Chase",
  venue: "American Airlines Center",
  opponent: "Colorado Avalanche",
  homeTeam: "Dallas Stars",
  gameDate: "Friday · January 22, 2027",
  gameTime: "7:00 PM",
  seatText: "Section ___ · Row ___ · Seats ___–___",

  lineup: [
    {
      name: "Blake",
      number: "01",
      position: "Birthday Captain",
      team: "Team Us",
      image: "/photos/blake.svg",
      bullets: [
        "Dallas Stars loyalist",
        "Elite boyfriend metrics",
        "Birthday status: activated",
      ],
    },
    {
      name: "Chase",
      number: "02",
      position: "Secret General Manager",
      team: "Team Us",
      image: "/photos/chase.svg",
      bullets: [
        "Responsible for suspicious roster moves",
        "Currently hiding one transaction",
        "Contract: renewed indefinitely",
      ],
    },
  ],

  highlights: [
    {
      label: "Seasons together",
      value: "∞",
      detail: "Front office expects an extension.",
    },
    {
      label: "Hackathons survived",
      value: "2",
      detail: "Somehow still speaking afterward.",
    },
    {
      label: "Road record",
      value: "UNDEFEATED",
      detail: "As long as snacks are involved.",
    },
  ],

  revealPhoto: "/photos/us.svg",

  note:
    "Happy birthday, my love. I wanted your present to feel like more than opening an envelope, so you had to win it first. I cannot wait to go watch the Stars with you. See you at puck drop <3",
};
