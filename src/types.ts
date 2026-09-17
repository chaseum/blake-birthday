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
  /** Slide length in ms (highlights), default HIGHLIGHT_BEAT. Should outlast the clip so the payoff shows. */
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
  /** Blake's age this birthday; `playerNumber` is his jersey everywhere he appears as a player. */
  age: number;
  playerNumber: string;
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
  /** Highlight slides, in order. */
  memories: MemoryPhoto[];
  /** Final collage (five polaroids), chosen independently of highlight order. */
  finalPhotos: MemoryPhoto[];
  /** Background music (looped, mixed by src/audio/AudioDirector.ts). */
  music: string;
  /** Stage cues, faded in/out by the AudioDirector: hype song and the real goal horn. */
  cues: { puckOff: string; goalHorn: string };
  stats: BroadcastStat[];
  ticket: TicketDetails;
  note: string;
};
