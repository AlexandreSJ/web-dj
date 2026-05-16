# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (root + client)
bun install && cd client && bun install && cd ..

# Development (backend + frontend concurrently)
bun run dev

# Client only
cd client && bun run dev

# Build frontend
cd client && bun run build

# Production (build + serve)
cd client && bun run build && cd .. && bun run start

# Lint (client only)
cd client && bun run lint
```

No test framework is set up yet.

## Project Overview

Web DJ — real-time collaborative step sequencer. Single shared room, no auth, no persistence. Open page, click cells, make music together.

**Phase 1 (local sequencer) is complete. Phase 2 (WebSocket multi-user sync) is next.**

## Architecture

Two separate packages in one repo:

- **`src/`** — Hono backend (Bun runtime). Currently placeholder Hono app (`src/index.ts` only). Will become WebSocket server holding room state.
- **`client/`** — React 19 + Vite + TypeScript frontend. All current functionality lives here.

### Backend (Phase 2 target)

- `src/index.ts` — Hono app. Needs WebSocket upgrade on `/ws`, state broadcast logic.
- Server holds single source of truth: grid state, BPM, connected users.
- WebSocket protocol: `cell-toggle`, `cell-update`, `bpm-change`, `bpm-update`, `play-state`, `play-update`, `full-state`, `user-joined`, `user-left`.

### Frontend

**Audio engine** (`client/src/audio/engine.ts`):
- All synths connect to shared bus: `Gain → Compressor → Limiter → Destination`
- 5 instruments: PolySynth(FMSynth) for synth-lead, PolySynth(MonoSynth) for bass, PolySynth(MonoSynth) for brass, PolySynth(Synth/triangle) for piano, percussion synths for drums
- Toms share single MembraneSynth with pitch variation
- Must use Tone.js v15 API: `Tone.getTransport()`, `Tone.getDestination()`, `.connect(dest)`

**Hooks:**
- `useAudioEngine` — wraps `Tone.start()`, volume control
- `useSequencer` — `Tone.Loop` on 16th notes, reads grid state via ref, triggers `playNote()` per active cell. Single `setState` per tick for performance.
- `useGridState` — local state only (Phase 2: will add WebSocket sync with optimistic updates). Enforces polyphony limits: bass/brass max 1 active voice per column, others max 4.

**Components:**
- `InstrumentGrid` — renders one instrument's 8×16 grid section
- `Cell` — individual grid cell, `React.memo`'d
- `TransportBar` — play/stop, BPM slider, clear controls
- `StepIndicator` — highlights current playback step
- `FunButtons` — misc UI effects (canvas-confetti)
- `UserPresence` — placeholder for Phase 2 multi-user display

**Performance critical:** The sequencer ticks 4-8x/second. Each tick triggers React state update. Cells are `React.memo`'d. Active instruments communicated via callback subscription (not state) to avoid re-render storms. Do NOT add extra `setState` calls in the tick loop.

### Grid Structure

- 5 instruments × 8 rows × 16 steps
- Instrument order: Drums (orange `#ff6600`), Synth Lead (cyan `#00fff2`), Bass (magenta `#ff00ff`), Brass (gold `#d4a017`), Piano (yellow `#fff700`)
- BPM range: 80–180, step 10, default 120

### Types (`client/src/types.ts`)

Shared type definitions. `WsMessage` union type defines the WebSocket protocol. `INSTRUMENTS` array is the source of truth for instrument config. **`Grid` type is `Record<number, boolean[]>`** — keyed by row index, values are 16-element boolean arrays.

## Key Constraints

- Tone.js v15 API only: `Tone.getTransport()` not `Tone.Transport`, `Tone.getDestination()` not `Tone.Destination`
- All melodic synths are `PolySynth` wrappers with `maxPolyphony = 8`
- `releaseAllVoices()` called at end of every 16-step cycle to prevent voice accumulation
- BPM clamped to 80–180, rounded to nearest 10
- Browser audio context requires user gesture — "Click anywhere to start" overlay

## Vercel Deployment

`vercel.json` configured for static frontend deploy. Backend WebSocket not yet wired.
