# Web DJ

Um step sequencer colaborativo em tempo real. Uma rave online onde qualquer um pode entrar e fazer música junto.

## O Que É Isso

O Web DJ é uma grade musical compartilhada. Abra a página, veja um sequenciador neon, clique nas células para ativar notas. Todo mundo conectado vê as mudanças instantaneamente. O beat toca em loop para todos.

Sem cadastro. Sem salas. Uma rave compartilhada.

## Funcionalidades

- **5 instrumentos** — Synth Lead, Bass, Pluck/Strings, Piano/Keys, Drums
- **8 linhas por instrumento** — 8 notas (escala de Dó maior) para melódicos, 8 tipos de percussão para drums
- **16 passos** — loop clássico de step sequencer
- **Colaboração em tempo real** — WebSocket envia cada edição para todos os usuários instantaneamente
- **BPM colaborativo** — slider de 60 a 240 (passo 10), qualquer um pode mudar
- **UI neon cyberpunk** — fundo escuro, células brilhantes com cor por instrumento
- **Áudio híbrido** — Sintetizadores Tone.js para instrumentos melódicos + percussão sintetizada
- **Sem autenticação, sem persistência** — sessão de jam efêmera

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Backend | Hono no Bun, WebSocket |
| Frontend | React 19, Vite, TypeScript |
| Áudio | Tone.js (FMSynth, MonoSynth, PluckSynth, Sampler, MembraneSynth, MetalSynth) |
| Tempo real | WebSocket (hibrido: estado no servidor + playback no cliente) |

## Início Rápido

### Pré-requisitos

- Runtime [Bun](https://bun.sh/)

### Instalar & Rodar

```bash
# Instalar dependências
bun install
cd client && bun install && cd ..

# Iniciar servidor dev (backend + frontend)
bun run dev
```

O app roda em `http://localhost:3000`.

### Build para Produção

```bash
cd client && bun run build && cd ..
bun run start
```

## Arquitetura

```
web-dj/
├── src/                    # Backend (Hono + Bun WebSocket)
│   ├── index.ts            # Entrada do servidor, handler WS, broadcast
│   ├── state.ts            # Estado da sala em memória
│   └── types.ts            # Tipos TypeScript compartilhados
├── client/                 # Frontend (React + Vite)
│   └── src/
│       ├── components/     # Grid, Cells, TransportBar, StepIndicator
│       ├── hooks/          # useWebSocket, useSequencer, useAudioEngine, useGridState
│       ├── audio/          # Definições de instrumentos Tone.js
│       └── styles/         # CSS neon cyberpunk
├── docs/
│   └── ARCHITECTURE.md     # Documentação completa da arquitetura (em inglês)
└── package.json
```

### Como Funciona

1. **Servidor** guarda a fonte de verdade: estado da grade, BPM, usuários conectados
2. **Cliente alterna uma célula** → envia `cell-toggle` via WebSocket
3. **Servidor atualiza o estado** → faz broadcast de `cell-update` para todos os clientes
4. **Cada cliente** roda seu próprio Tone.js Transport sincronizado com o BPM compartilhado
5. **A cada semicolcheia**, o sequenciador verifica a grade e dispara as notas ativas
6. **Sem tick do servidor** — possível drift sub-100ms, imperceptível na prática

### Instrumentos & Grade

Cada instrumento tem uma grade 8×16 (8 notas/tipos de percussão × 16 passos de tempo):

| Instrumento | Linhas | Áudio |
|---|---|---|
| Synth Lead | C5 B4 A4 G4 F4 E4 D4 C4 | PolySynth(FMSynth) |
| Bass | C3 B2 A2 G2 F2 E2 D2 C2 | MonoSynth |
| Pluck/Strings | C5 B4 A4 G4 F4 E4 D4 C4 | PluckSynth |
| Piano/Keys | C5 B4 A4 G4 F4 E4 D4 C4 | Sampler |
| Drums | Kick, Snare, Clap, HH Fechado, HH Aberto, Tom Agudo, Tom Médio, Tom Grave | MembraneSynth + MetalSynth + NoiseSynth |

### Protocolo WebSocket

| Mensagem | Direção | Propósito |
|---|---|---|
| `cell-toggle` | Cliente→Servidor | Alternar célula da grade |
| `cell-update` | Servidor→Todos | Broadcast de mudança de célula |
| `bpm-change` | Cliente→Servidor | Mudar tempo |
| `bpm-update` | Servidor→Todos | Broadcast de mudança de tempo |
| `full-state` | Servidor→Novo cliente | Enviar estado completo da sala |
| `user-joined` / `user-left` | Servidor→Todos | Atualizações de presença |

## Licença

Apache 2.0
