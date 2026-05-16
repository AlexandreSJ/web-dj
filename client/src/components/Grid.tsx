import { useState, useCallback, useEffect } from "react";
import type { InstrumentId, Grid as GridType } from "../types";
import { INSTRUMENTS } from "../types";
import { InstrumentGrid } from "./InstrumentGrid";

interface GridProps {
  grid: Record<InstrumentId, GridType>;
  currentStep: number;
  subscribeActive: (cb: (active: Set<InstrumentId>) => void) => void;
  onToggle: (instrument: InstrumentId, row: number, col: number) => void;
  onClearInstrument: (instrument: InstrumentId) => void;
  onClearBeatGroup: (instrument: InstrumentId, beatStart: number) => void;
  onClearAll: () => void;
}

export function Grid({ grid, currentStep, subscribeActive, onToggle, onClearInstrument, onClearBeatGroup, onClearAll }: GridProps) {
  const [dragValue, setDragValue] = useState<boolean | null>(null);
  const [dragInstrument, setDragInstrument] = useState<InstrumentId | null>(null);
  const [activeSet, setActiveSet] = useState<Set<InstrumentId>>(new Set());

  // Subscribe to active instrument changes — updates only when needed
  useEffect(() => {
    subscribeActive((active) => {
      setActiveSet(active);
    });
  }, [subscribeActive]);

  const handleToggle = useCallback((instrument: InstrumentId, row: number, col: number) => {
    const current = grid[instrument]?.[row]?.[col] ?? false;
    setDragValue(!current);
    setDragInstrument(instrument);
    onToggle(instrument, row, col);
  }, [grid, onToggle]);

  const handleDragEnter = useCallback((instrument: InstrumentId, row: number, col: number) => {
    if (dragValue === null || instrument !== dragInstrument) return;
    const current = grid[instrument]?.[row]?.[col] ?? false;
    if (current !== dragValue) {
      onToggle(instrument, row, col);
    }
  }, [dragValue, dragInstrument, grid, onToggle]);

  const handleMouseUp = useCallback(() => {
    setDragValue(null);
    setDragInstrument(null);
  }, []);

  return (
    <div className="grid-container" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="global-clear-row">
        <button className="clear-btn clear-all-btn" onClick={onClearAll}>
          CLEAR ALL
        </button>
      </div>
      {INSTRUMENTS.map(inst => (
        <InstrumentGrid
          key={inst.id}
          instrumentId={inst.id}
          grid={grid[inst.id] ?? {}}
          currentStep={currentStep}
          dragValue={dragValue}
          isActive={activeSet.has(inst.id)}
          defaultOpen={inst.id === "drums"}
          onToggle={(row, col) => handleToggle(inst.id, row, col)}
          onDragEnter={(row, col) => handleDragEnter(inst.id, row, col)}
          onClearInstrument={() => onClearInstrument(inst.id)}
          onClearBeatGroup={(beatStart) => onClearBeatGroup(inst.id, beatStart)}
        />
      ))}
    </div>
  );
}
