export type LineupMember = {
  name: string;
  number: string;
  role: string;
  image: string;
  imagePosition?: string;
};

export type MemoryPhoto = {
  src: string;
  alt: string;
  caption: string;
  position?: string;
  /** "contain" for art/illustrations that must not be cropped. */
  fit?: "cover" | "contain";
};

export type BroadcastStat = {
  label: string;
  value: string;
  detail: string;
};

export type TicketDetails = {
  section: string;
  row: string;
  seats: [string, string];
};

export type BirthdayConfig = {
  birthdayName: string;
  partnerName: string;
  venue: string;
  venueAddress: [string, string];
  opponent: string;
  homeTeam: string;
  gameDay: string;
  gameDate: string;
  gameTime: string;
  arenaImage: string;
  arenaCredit: {
    label: string;
    sourceUrl: string;
    license: string;
    licenseUrl: string;
  };
  lineup: LineupMember[];
  memories: MemoryPhoto[];
  stats: BroadcastStat[];
  ticket: TicketDetails;
  note: string;
};
