export type InstrumentId = "synth-lead" | "bass" | "piano" | "brass" | "drums";

export type Grid = Record<number, boolean[]>; // row index → 16 booleans

export interface RoomState {
  bpm: number;
  playing: boolean;
  grid: Record<InstrumentId, Grid>;
}

export interface UserInfo {
  id: string;
  name: string;
  color: string;
}

// WebSocket messages
export type WsMessage =
  | { type: "cell-toggle"; instrument: InstrumentId; row: number; col: number; value: boolean }
  | { type: "cell-update"; instrument: InstrumentId; row: number; col: number; value: boolean; userId: string }
  | { type: "bpm-change"; bpm: number }
  | { type: "bpm-update"; bpm: number }
  | { type: "play-state"; playing: boolean }
  | { type: "play-update"; playing: boolean }
  | { type: "full-state"; bpm: number; playing: boolean; grid: Record<InstrumentId, Grid>; users: UserInfo[] }
  | { type: "user-joined"; userId: string; userCount: number }
  | { type: "user-left"; userId: string; userCount: number };

// Instrument config
export interface InstrumentConfig {
  id: InstrumentId;
  label: string;
  color: string;
  rows: RowConfig[];
}

export interface RowConfig {
  label: string;
  note?: string;       // MIDI note name for melodic
  freq?: number;       // Hz for melodic
  drumType?: string;   // drum identifier
}

export const INSTRUMENTS: InstrumentConfig[] = [
  {
    id: "drums",
    label: "Drums",
    color: "#ff6600",
    rows: [
      { label: "Kick", drumType: "kick" },
      { label: "Snare", drumType: "snare" },
      { label: "Clap", drumType: "clap" },
      { label: "HH ●", drumType: "hh-closed" },
      { label: "HH ○", drumType: "hh-open" },
      { label: "Tom H", drumType: "tom-hi" },
      { label: "Tom M", drumType: "tom-mid" },
      { label: "Tom L", drumType: "tom-lo" },
    ],
  },
  {
    id: "synth-lead",
    label: "Synth Lead",
    color: "#00fff2",
    rows: [
      { label: "C5", note: "C5", freq: 523 },
      { label: "B4", note: "B4", freq: 494 },
      { label: "A4", note: "A4", freq: 440 },
      { label: "G4", note: "G4", freq: 392 },
      { label: "F4", note: "F4", freq: 349 },
      { label: "E4", note: "E4", freq: 330 },
      { label: "D4", note: "D4", freq: 294 },
      { label: "C4", note: "C4", freq: 262 },
    ],
  },
  {
    id: "bass",
    label: "Bass",
    color: "#ff00ff",
    rows: [
      { label: "C3", note: "C3", freq: 131 },
      { label: "B2", note: "B2", freq: 123 },
      { label: "A2", note: "A2", freq: 110 },
      { label: "G2", note: "G2", freq: 98 },
      { label: "F2", note: "F2", freq: 87 },
      { label: "E2", note: "E2", freq: 82 },
      { label: "D2", note: "D2", freq: 73 },
      { label: "C2", note: "C2", freq: 65 },
    ],
  },
  {
    id: "brass",
    label: "Brass",
    color: "#d4a017",
    rows: [
      { label: "C4", note: "C4", freq: 262 },
      { label: "B3", note: "B3", freq: 247 },
      { label: "A3", note: "A3", freq: 220 },
      { label: "G3", note: "G3", freq: 196 },
      { label: "F3", note: "F3", freq: 175 },
      { label: "E3", note: "E3", freq: 165 },
      { label: "D3", note: "D3", freq: 147 },
      { label: "C3", note: "C3", freq: 131 },
    ],
  },
  {
    id: "piano",
    label: "Piano / Keys",
    color: "#fff700",
    rows: [
      { label: "C5", note: "C5", freq: 523 },
      { label: "B4", note: "B4", freq: 494 },
      { label: "A4", note: "A4", freq: 440 },
      { label: "G4", note: "G4", freq: 392 },
      { label: "F4", note: "F4", freq: 349 },
      { label: "E4", note: "E4", freq: 330 },
      { label: "D4", note: "D4", freq: 294 },
      { label: "C4", note: "C4", freq: 262 },
    ],
  },
];

export const DEFAULT_BPM = 120;
export const MIN_BPM = 80;
export const MAX_BPM = 180;
export const STEPS = 16;
export const ROWS = 8;

export function createEmptyGrid(): Record<InstrumentId, Grid> {
  const grid: Record<string, Grid> = {};
  for (const inst of INSTRUMENTS) {
    grid[inst.id] = {};
    for (let r = 0; r < ROWS; r++) {
      grid[inst.id][r] = new Array(STEPS).fill(false) as boolean[];
    }
  }
  return grid as Record<InstrumentId, Grid>;
}
