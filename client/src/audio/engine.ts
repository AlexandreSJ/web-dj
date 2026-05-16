import * as Tone from "tone";
import type { InstrumentId, RowConfig } from "../types";

type InstrumentMap = Record<InstrumentId, Tone.ToneAudioNode>;

let instruments: InstrumentMap | null = null;
let drumSynths: Record<string, Tone.ToneAudioNode> | null = null;

let masterBus: Tone.Gain | null = null;
let compressor: Tone.Compressor | null = null;
let limiter: Tone.Limiter | null = null;

/** Shared bus: Gain → Compressor → Destination. All synths connect here. */
function bus(): Tone.Gain {
  if (!masterBus) {
    limiter = new Tone.Limiter(-1).connect(Tone.getDestination());
    compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.1,
    }).connect(limiter);
    masterBus = new Tone.Gain(1).connect(compressor);
  }
  return masterBus;
}

function createMelodicSynths(): void {
  const b = bus();
  const synthLead = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3,
    modulationIndex: 10,
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.3 },
    modulation: { type: "square" },
    modulationEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 },
  }).connect(b);
  synthLead.maxPolyphony = 8;
  synthLead.volume.value = -8;

  const bass = new Tone.PolySynth(Tone.MonoSynth, {
    oscillator: { type: "sawtooth" },
    filter: { Q: 2, type: "lowpass", rolloff: -24 },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.3 },
    filterEnvelope: {
      attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.3,
      baseFrequency: 100, octaves: 2.5,
    },
  }).connect(b);
  bass.maxPolyphony = 8;
  bass.volume.value = -6;

  const brass = new Tone.PolySynth(Tone.MonoSynth, {
    oscillator: { type: "sawtooth" },
    filter: { Q: 1, type: "lowpass", rolloff: -12 },
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.3 },
    filterEnvelope: {
      attack: 0.05, decay: 0.3, sustain: 0.5, release: 0.3,
      baseFrequency: 200, octaves: 5,
    },
  }).connect(b);
  brass.maxPolyphony = 8;
  brass.volume.value = -8;

  const piano = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.005, decay: 0.5, sustain: 0.1, release: 0.5 },
  }).connect(b);
  piano.maxPolyphony = 8;
  piano.volume.value = -8;

  instruments = { "synth-lead": synthLead, bass, brass, piano, drums: synthLead };
}

function createDrumSynths(): void {
  const b = bus();
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05, octaves: 10,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
  }).connect(b);
  kick.volume.value = -4;

  const snareNoise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
  }).connect(b);
  snareNoise.volume.value = -10;

  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.01, octaves: 4,
    oscillator: { type: "triangle" },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.08 },
  }).connect(b);
  snareBody.volume.value = -10;

  const clapNoise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 },
  }).connect(b);
  clapNoise.volume.value = -10;

  const hhClosed = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
    harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
  }).connect(b);
  hhClosed.frequency.value = 400;
  hhClosed.volume.value = -14;

  const hhOpen = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.3, release: 0.2 },
    harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
  }).connect(b);
  hhOpen.frequency.value = 400;
  hhOpen.volume.value = -14;

  // Share single MembraneSynth for all toms — pitch varies per hit
  const tomSynth = new Tone.MembraneSynth({
    pitchDecay: 0.04, octaves: 6,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.4 },
  }).connect(b);
  tomSynth.volume.value = -8;

  drumSynths = { kick, snare: snareNoise, "snare-body": snareBody, clap: clapNoise, "hh-closed": hhClosed, "hh-open": hhOpen, "tom": tomSynth };
}

export function initAudio(): void {
  if (instruments) return;
  createMelodicSynths();
  createDrumSynths();
}

export async function startAudio(): Promise<void> {
  await Tone.start();
  initAudio();
}

export function playNote(instrumentId: InstrumentId, rowConfig: RowConfig, time?: number): void {
  if (!instruments) initAudio();
  const t = time ?? Tone.now();

  if (instrumentId === "drums" && drumSynths) {
    playDrum(rowConfig, t);
    return;
  }

  const inst = instruments![instrumentId];
  if (rowConfig.note && inst instanceof Tone.PolySynth) {
    inst.triggerRelease(rowConfig.note, t);
    inst.triggerAttackRelease(rowConfig.note, instrumentId === "bass" ? "16n" : "16n", t);
  }
}

export function releaseAllVoices(): void {
  if (!instruments) return;
  for (const inst of Object.values(instruments)) {
    if (inst instanceof Tone.PolySynth) {
      inst.releaseAll();
    }
  }
}

function playDrum(rowConfig: RowConfig, time: number): void {
  if (!drumSynths) return;
  const dt = rowConfig.drumType;
  if (!dt) return;

  switch (dt) {
    case "kick": (drumSynths.kick as Tone.MembraneSynth).triggerAttackRelease("C1", "16n", time); break;
    case "snare":
      (drumSynths.snare as Tone.NoiseSynth).triggerAttackRelease("16n", time);
      (drumSynths["snare-body"] as Tone.MembraneSynth).triggerAttackRelease("E2", "16n", time);
      break;
    case "clap": (drumSynths.clap as Tone.NoiseSynth).triggerAttackRelease("16n", time); break;
    case "hh-closed": (drumSynths["hh-closed"] as Tone.MetalSynth).triggerAttackRelease("32n", time); break;
    case "hh-open": (drumSynths["hh-open"] as Tone.MetalSynth).triggerAttackRelease("16n", time); break;
    case "tom-hi": (drumSynths.tom as Tone.MembraneSynth).triggerAttackRelease("G2", "16n", time); break;
    case "tom-mid": (drumSynths.tom as Tone.MembraneSynth).triggerAttackRelease("D2", "16n", time); break;
    case "tom-lo": (drumSynths.tom as Tone.MembraneSynth).triggerAttackRelease("A1", "16n", time); break;
  }
}

export function setBpm(bpm: number): void {
  Tone.getTransport().bpm.value = bpm;
}

export function setVolume(value: number): void {
  if (!masterBus) return;
  const db = value === 0 ? -Infinity : (value / 100) * 40 - 40;
  masterBus.gain.value = db === -Infinity ? 0 : Math.pow(10, db / 20);
}

export function startTransport(): void {
  Tone.getTransport().start();
}

export function stopTransport(): void {
  Tone.getTransport().stop();
  Tone.getTransport().position = 0;
}
