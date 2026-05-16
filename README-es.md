# Web DJ

Un secuenciador de pasos colaborativo en tiempo real. Un rave online donde cualquiera puede unirse y hacer música juntos.

## Qué Es Esto

Web DJ es una grilla musical compartida. Abrí la página, mirá un secuenciador neon, hacé clic en las celdas para activar notas. Todos los conectados ven los cambios al instante. El beat se reproduce en loop para todos.

Sin registro. Sin salas. Un rave compartido.

## Funcionalidades

- **5 instrumentos** — Synth Lead, Bass, Pluck/Strings, Piano/Keys, Drums
- **8 filas por instrumento** — 8 notas (escala de Do mayor) para melódicos, 8 tipos de percusión para drums
- **16 pasos** — loop clásico de step sequencer
- **Colaboración en tiempo real** — WebSocket envía cada edición a todos los usuarios al instante
- **BPM colaborativo** — slider de 60 a 240 ( paso 10), cualquiera puede cambiarlo
- **UI neon cyberpunk** — fondo oscuro, celdas brillantes con color por instrumento
- **Audio híbrido** — Sintetizadores Tone.js para instrumentos melódicos + percusión sintetizada
- **Sin autenticación, sin persistencia** — sesión de jam efímera

## Stack Técnico

| Capa | Tecnología |
|---|---|
| Backend | Hono en Bun, WebSocket |
| Frontend | React 19, Vite, TypeScript |
| Audio | Tone.js (FMSynth, MonoSynth, PluckSynth, Sampler, MembraneSynth, MetalSynth) |
| Tiempo real | WebSocket (híbrido: estado en servidor + playback en cliente) |

## Inicio Rápido

### Requisitos

- Runtime [Bun](https://bun.sh/)

### Instalar y Ejecutar

```bash
# Instalar dependencias
bun install
cd client && bun install && cd ..

# Iniciar servidor dev (backend + frontend)
bun run dev
```

La app corre en `http://localhost:3000`.

### Build para Producción

```bash
cd client && bun run build && cd ..
bun run start
```

## Arquitectura

```
web-dj/
├── src/                    # Backend (Hono + Bun WebSocket)
│   ├── index.ts            # Entrada del servidor, handler WS, broadcast
│   ├── state.ts            # Estado de la sala en memoria
│   └── types.ts            # Tipos TypeScript compartidos
├── client/                 # Frontend (React + Vite)
│   └── src/
│       ├── components/     # Grid, Cells, TransportBar, StepIndicator
│       ├── hooks/          # useWebSocket, useSequencer, useAudioEngine, useGridState
│       ├── audio/          # Definiciones de instrumentos Tone.js
│       └── styles/         # CSS neon cyberpunk
├── docs/
│   └── ARCHITECTURE.md     # Documentación completa de arquitectura (en inglés)
└── package.json
```

### Cómo Funciona

1. **El servidor** guarda la fuente de verdad: estado de la grilla, BPM, usuarios conectados
2. **El cliente alterna una celda** → envía `cell-toggle` via WebSocket
3. **El servidor actualiza el estado** → hace broadcast de `cell-update` a todos los clientes
4. **Cada cliente** ejecuta su propio Tone.js Transport sincronizado con el BPM compartido
5. **Cada semicorchea**, el secuenciador verifica la grilla y dispara las notas activas
6. **Sin tick del servidor** — posible drift sub-100ms, imperceptible en la práctica

### Instrumentos y Grilla

Cada instrumento tiene una grilla de 8×16 (8 notas/tipos de percusión × 16 pasos de tiempo):

| Instrumento | Filas | Audio |
|---|---|---|
| Synth Lead | C5 B4 A4 G4 F4 E4 D4 C4 | PolySynth(FMSynth) |
| Bass | C3 B2 A2 G2 F2 E2 D2 C2 | MonoSynth |
| Pluck/Strings | C5 B4 A4 G4 F4 E4 D4 C4 | PluckSynth |
| Piano/Keys | C5 B4 A4 G4 F4 E4 D4 C4 | Sampler |
| Drums | Kick, Snare, Clap, HH Cerrado, HH Abierto, Tom Agudo, Tom Medio, Tom Grave | MembraneSynth + MetalSynth + NoiseSynth |

### Protocolo WebSocket

| Mensaje | Dirección | Propósito |
|---|---|---|
| `cell-toggle` | Cliente→Servidor | Alternar celda de la grilla |
| `cell-update` | Servidor→Todos | Broadcast de cambio de celda |
| `bpm-change` | Cliente→Servidor | Cambiar tempo |
| `bpm-update` | Servidor→Todos | Broadcast de cambio de tempo |
| `full-state` | Servidor→Nuevo cliente | Enviar estado completo de la sala |
| `user-joined` / `user-left` | Servidor→Todos | Actualizaciones de presencia |

## Licencia

Apache 2.0
