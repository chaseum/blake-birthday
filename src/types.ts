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
  /** Optional muted clip; `src` is its poster frame. */
  video?: string;
  /** Slide length in ms (highlights), default HIGHLIGHT_BEAT. */
  duration?: number;
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
  /** Secret until the ticket reveal — never render before the winning goal. */
  opponent: string;
  opponentAbbr: string;
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
  fanCam: MemoryPhoto[];
  memories: MemoryPhoto[];
  stats: BroadcastStat[];
  ticket: TicketDetails;
  note: string;
};
