import { useState, useCallback } from "react";
import type { InstrumentId, RoomState } from "../types";
import { createEmptyGrid, DEFAULT_BPM, MIN_BPM, MAX_BPM, STEPS, ROWS } from "../types";

export function useGridState() {
  const [state, setState] = useState<RoomState>({
    bpm: DEFAULT_BPM,
    playing: true,
    grid: createEmptyGrid(),
  });

  const toggleCell = useCallback((instrument: InstrumentId, row: number, col: number) => {
    setState(prev => {
      const newGrid = { ...prev.grid };
      const instGrid = { ...newGrid[instrument] };
      const rowArr = [...(instGrid[row] ?? new Array(STEPS).fill(false))];
      if (!rowArr[col]) {
        const max = instrument === "bass" || instrument === "brass" ? 1 : 4;
        const active = Object.values(instGrid).filter(r => r?.[col]).length;
        if (active >= max) return prev;
      }
      rowArr[col] = !rowArr[col];
      instGrid[row] = rowArr;
      newGrid[instrument] = instGrid;
      return { ...prev, grid: newGrid };
    });
  }, []);

  const setBpm = useCallback((bpm: number) => {
    const clamped = Math.round(bpm / 10) * 10;
    setState(prev => ({ ...prev, bpm: Math.max(MIN_BPM, Math.min(MAX_BPM, clamped)) }));
  }, []);

  const clearInstrument = useCallback((instrument: InstrumentId) => {
    setState(prev => {
      const newGrid = { ...prev.grid };
      newGrid[instrument] = {};
      for (let r = 0; r < ROWS; r++) {
        newGrid[instrument][r] = new Array(STEPS).fill(false);
      }
      return { ...prev, grid: newGrid };
    });
  }, []);

  const clearBeatGroup = useCallback((instrument: InstrumentId, beatStart: number) => {
    setState(prev => {
      const newGrid = { ...prev.grid };
      const instGrid = { ...newGrid[instrument] };
      for (let r = 0; r < ROWS; r++) {
        const rowArr = [...(instGrid[r] ?? new Array(STEPS).fill(false))];
        for (let c = beatStart; c < beatStart + 4 && c < STEPS; c++) {
          rowArr[c] = false;
        }
        instGrid[r] = rowArr;
      }
      newGrid[instrument] = instGrid;
      return { ...prev, grid: newGrid };
    });
  }, []);

  const clearAll = useCallback(() => {
    setState(prev => ({ ...prev, grid: createEmptyGrid() }));
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    setState(prev => ({ ...prev, playing }));
  }, []);

  return {
    grid: state.grid,
    bpm: state.bpm,
    playing: state.playing,
    toggleCell,
    setBpm,
    setPlaying,
    clearInstrument,
    clearBeatGroup,
    clearAll,
  };
}
