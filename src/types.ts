export type Highlight = {
  label: string;
  value: string;
  detail?: string;
};

export type PlayerCard = {
  name: string;
  number: string;
  position: string;
  team: string;
  image: string;
  bullets: string[];
};

export type BirthdayConfig = {
  birthdayName: string;
  partnerName: string;
  venue: string;
  opponent: string;
  homeTeam: string;
  gameDate: string;
  gameTime: string;
  seatText: string;
  lineup: PlayerCard[];
  highlights: Highlight[];
  revealPhoto: string;
  note: string;
};
