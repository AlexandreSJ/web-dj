import { memo } from "react";

interface CellProps {
  active: boolean;
  color: string;
  currentStep: boolean;
  col: number;
  dragValue: boolean | null;
  highlightClear: boolean;
  onToggle: () => void;
  onDragEnter: () => void;
}

export const Cell = memo(function Cell({ active, color, currentStep, col, dragValue, highlightClear, onToggle, onDragEnter }: CellProps) {
  const isBeatStart = col > 0 && col % 4 === 0;

  const cellColor = highlightClear && active ? "#ff4444" : color;
  const bg = active
    ? (highlightClear ? "#ff4444" : color)
    : undefined;
  const shadow = active
    ? (highlightClear ? "0 0 8px #ff444480" : `0 0 8px ${color}80, inset 0 0 4px ${color}40`)
    : undefined;

  return (
    <div
      className={`cell${active ? " on" : ""}${currentStep ? " current-step" : ""}${highlightClear && active ? " clear-highlight" : ""}`}
      style={{ "--cell-color": cellColor, background: bg, boxShadow: shadow } as React.CSSProperties}
      data-beat={isBeatStart || undefined}
      onMouseDown={(e) => { e.preventDefault(); onToggle(); }}
      onMouseEnter={() => { if (dragValue !== null) onDragEnter(); }}
      onTouchStart={(e) => { e.preventDefault(); onToggle(); }}
      role="checkbox"
      aria-checked={active}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); }}}
    />
  );
});
