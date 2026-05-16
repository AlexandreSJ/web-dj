import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { playNote, setBpm, startTransport, stopTransport } from "../audio/engine";
import type { InstrumentId, Grid } from "../types";
import { INSTRUMENTS, STEPS } from "../types";

export function useSequencer(
  grid: Record<InstrumentId, Grid>,
  bpm: number,
  playing: boolean,
) {
  const [currentStep, setCurrentStep] = useState(-1);
  const activeRef = useRef<Set<InstrumentId>>(new Set());
  const loopRef = useRef<Tone.Loop | null>(null);
  const stepRef = useRef(0);
  const gridRef = useRef(grid);
  const playingRef = useRef(playing);
  const activeCallbackRef = useRef<((active: Set<InstrumentId>) => void) | null>(null);

  gridRef.current = grid;
  playingRef.current = playing;

  useEffect(() => {
    setBpm(bpm);
  }, [bpm]);

  const subscribeActive = (cb: (active: Set<InstrumentId>) => void) => {
    activeCallbackRef.current = cb;
  };

  useEffect(() => {
    if (loopRef.current) {
      loopRef.current.dispose();
    }

    const loop = new Tone.Loop((time) => {
      const step = stepRef.current;

      // Single setState per tick — batch visual update
      setCurrentStep(step);

      if (playingRef.current) {
        const active = new Set<InstrumentId>();
        for (const inst of INSTRUMENTS) {
          const rows = gridRef.current[inst.id];
          if (!rows) continue;
          for (let r = 0; r < inst.rows.length; r++) {
            if (rows[r]?.[step]) {
              playNote(inst.id, inst.rows[r], time);
              active.add(inst.id);
            }
          }
        }
        activeRef.current = active;
        activeCallbackRef.current?.(active);
      } else {
        activeRef.current = new Set();
        activeCallbackRef.current?.(new Set());
      }

      stepRef.current = (step + 1) % STEPS;
    }, "16n");

    loopRef.current = loop;
    loop.start(0);

    stepRef.current = 0;
    setCurrentStep(0);
    startTransport();

    return () => {
      loop.dispose();
    };
  }, []);

  // Handle play/stop
  useEffect(() => {
    if (playing) {
      stepRef.current = 0;
      setCurrentStep(0);
      startTransport();
    } else {
      stopTransport();
      setCurrentStep(-1);
      activeRef.current = new Set();
      stepRef.current = 0;
    }
  }, [playing]);

  return { currentStep, subscribeActive };
}
