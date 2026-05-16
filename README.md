# Web DJ

A real-time collaborative step sequencer. An online rave where anyone can join and make music together.

## What Is This

Web DJ is a shared music grid. Open the page, see a neon-lit sequencer, click cells to toggle notes. Everyone connected sees changes instantly. The beat loops and plays for all.

No sign-up. No rooms. One shared rave.

## Features

- **5 instruments** — Synth Lead, Bass, Pluck/Strings, Piano/Keys, Drums
- **8 rows per instrument** — 8 notes (C major scale) for melodic, 8 percussion types for drums
- **16 steps** — classic step sequencer loop
- **Real-time collaboration** — WebSocket broadcasts every edit to all users instantly
- **Collaborative BPM** — slider from 60 to 240 (step 10), anyone can change it
- **Neon cyberpunk UI** — dark background, glowing cells per instrument color
- **Hybrid audio** — Tone.js synthesizers for melodic instruments + synthesized percussion
- **No auth, no persistence** — pure ephemeral jam session

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Hono on Bun, WebSocket |
| Frontend | React 19, Vite, TypeScript |
| Audio | Tone.js (FMSynth, MonoSynth, PluckSynth, Sampler, MembraneSynth, MetalSynth) |
| Real-time | WebSocket (server-state + client-playback hybrid) |

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) runtime

### Install & Run

```bash
# Install dependencies
bun install
cd client && bun install && cd ..

# Start dev server (backend + frontend)
bun run dev
```

The app runs at `http://localhost:3000`.

### Build for Production

```bash
cd client && bun run build && cd ..
bun run start
```

## Architecture

```
web-dj/
├── src/                    # Backend (Hono + Bun WebSocket)
│   ├── index.ts            # Server entry, WS handler, broadcast
│   ├── state.ts            # In-memory room state
│   └── types.ts            # Shared TypeScript types
├── client/                 # Frontend (React + Vite)
│   └── src/
│       ├── components/     # Grid, Cells, TransportBar, StepIndicator
│       ├── hooks/          # useWebSocket, useSequencer, useAudioEngine, useGridState
│       ├── audio/          # Tone.js instrument definitions
│       └── styles/         # Neon cyberpunk CSS
├── docs/
│   └── ARCHITECTURE.md     # Full architecture documentation
└── package.json
```

### How It Works

1. **Server** holds the single source of truth: grid state, BPM, connected users
2. **Client toggles a cell** → sends `cell-toggle` via WebSocket
3. **Server updates state** → broadcasts `cell-update` to all clients
4. **Each client** runs its own Tone.js Transport synced to the shared BPM
5. **Every 16th note**, the sequencer checks the grid and triggers active notes
6. **No server tick** — minor sub-100ms drift possible, imperceptible in practice

### Instruments & Grid

Each instrument has an 8×16 grid (8 notes/percussion types × 16 time steps):

| Instrument | Rows | Audio |
|---|---|---|
| Synth Lead | C5 B4 A4 G4 F4 E4 D4 C4 | PolySynth(FMSynth) |
| Bass | C3 B2 A2 G2 F2 E2 D2 C2 | MonoSynth |
| Pluck/Strings | C5 B4 A4 G4 F4 E4 D4 C4 | PluckSynth |
| Piano/Keys | C5 B4 A4 G4 F4 E4 D4 C4 | Sampler |
| Drums | Kick, Snare, Clap, HH Closed, HH Open, Tom Hi, Tom Mid, Tom Lo | MembraneSynth + MetalSynth + NoiseSynth |

### WebSocket Protocol

| Message | Direction | Purpose |
|---|---|---|
| `cell-toggle` | Client→Server | Toggle a grid cell |
| `cell-update` | Server→All | Broadcast cell change |
| `bpm-change` | Client→Server | Change tempo |
| `bpm-update` | Server→All | Broadcast tempo change |
| `full-state` | Server→New client | Send entire room state |
| `user-joined` / `user-left` | Server→All | Presence updates |

## License

Apache 2.0
