import { useState } from "react";
import type { InstrumentId, Grid as GridType } from "../types";
import { INSTRUMENTS, STEPS } from "../types";
import { Cell } from "./Cell";

interface InstrumentGridProps {
  instrumentId: InstrumentId;
  grid: GridType;
  currentStep: number;
  dragValue: boolean | null;
  isActive: boolean;
  defaultOpen: boolean;
  onToggle: (row: number, col: number) => void;
  onDragEnter: (row: number, col: number) => void;
  onClearInstrument: () => void;
  onClearBeatGroup: (beatStart: number) => void;
}

export function InstrumentGrid({
  instrumentId, grid, currentStep, dragValue, isActive, defaultOpen,
  onToggle, onDragEnter, onClearInstrument, onClearBeatGroup,
}: InstrumentGridProps) {
  const [collapsed, setCollapsed] = useState(!defaultOpen);
  const [hoverBeat, setHoverBeat] = useState<number | null>(null);
  const [hoverAll, setHoverAll] = useState(false);
  const config = INSTRUMENTS.find(i => i.id === instrumentId);
  if (!config) return null;

  const beatGroups = [0, 4, 8, 12];

  return (
    <div className={`instrument-grid`}>
      <div className="inst-header-row">
        <div className="inst-header" onClick={() => setCollapsed(c => !c)}>
          <span className={`color-dot${isActive ? " dot-flash" : ""}`} style={{ background: config.color, boxShadow: isActive ? `0 0 12px ${config.color}` : `0 0 6px ${config.color}` }} />
          <span style={{ color: config.color, minWidth: '12em' }}>{config.label}</span>
          <span style={{ width: '100%' }}></span>
          <button
            className="clear-btn inst-clear"
            onClick={(e) => { e.stopPropagation(); onClearInstrument(); }}
            onMouseEnter={() => setHoverAll(true)}
            onMouseLeave={() => setHoverAll(false)}
            title="Clear all steps"
          >
            CLEAR
          </button>
          <span className="collapse-icon">{collapsed ? "▸" : "▾"}</span>
        </div>
      </div>
      {!collapsed && (
        <div className="inst-rows">
          <div className="inst-clear-btns">
            {beatGroups.map(start => (
              <button
                key={start}
                className="clear-btn beat-clear"
                onClick={(e) => { e.stopPropagation(); onClearBeatGroup(start); }}
                onMouseEnter={() => setHoverBeat(start)}
                onMouseLeave={() => setHoverBeat(null)}
                title={`Clear steps ${start + 1}-${start + 4}`}
              >
                ×
              </button>
            ))}
          </div>
          {config.rows.map((row, rowIdx) => (
            <div className="inst-row" key={rowIdx}>
              <span className="row-label">{row.label}</span>
              {Array.from({ length: STEPS }, (_, colIdx) => {
                const inHoverBeat = hoverBeat !== null && colIdx >= hoverBeat && colIdx < hoverBeat + 4;
                return (
                  <Cell
                    key={colIdx}
                    active={grid[rowIdx]?.[colIdx] ?? false}
                    color={config.color}
                    currentStep={colIdx === currentStep}
                    col={colIdx}
                    dragValue={dragValue}
                    highlightClear={hoverAll || inHoverBeat}
                    onToggle={() => onToggle(rowIdx, colIdx)}
                    onDragEnter={() => onDragEnter(rowIdx, colIdx)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
