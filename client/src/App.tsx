import { useCallback, useState } from "react";
import { useAudioEngine } from "./hooks/useAudioEngine";
import { useSequencer } from "./hooks/useSequencer";
import { useGridState } from "./hooks/useGridState";
import { TransportBar } from "./components/TransportBar";
import { StepIndicator } from "./components/StepIndicator";
import { Grid } from "./components/Grid";
import { FunButtons } from "./components/FunButtons";
import "./styles/neon.css";
import type { InstrumentId } from "./types";

function App() {
  const { audioStarted, init, changeVolume: applyVolume } = useAudioEngine();
  const { grid, bpm, playing, toggleCell, setBpm, setPlaying, clearInstrument, clearBeatGroup, clearAll } = useGridState();
  const { currentStep, subscribeActive } = useSequencer(grid, bpm, playing);
  const [volume, setVolume] = useState(80);

  const handleOverlayClick = useCallback(() => {
    init();
  }, [init]);

  const handleToggle = useCallback((instrument: InstrumentId, row: number, col: number) => {
    toggleCell(instrument, row, col);
  }, [toggleCell]);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    applyVolume(v);
  }, [applyVolume]);

  if (!audioStarted) {
    return (
      <div className="audio-overlay" onClick={handleOverlayClick}>
        <span>Click anywhere to start</span>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="fixed-top-bar">
        <TransportBar
          playing={playing}
          bpm={bpm}
          volume={volume}
          userCount={1}
          onPlayToggle={() => setPlaying(!playing)}
          onBpmChange={setBpm}
          onVolumeChange={handleVolumeChange}
        />
      </div>
      <div className="main-content">
        <StepIndicator currentStep={currentStep} />
        <Grid
          grid={grid}
          currentStep={currentStep}
          subscribeActive={subscribeActive}
          onToggle={handleToggle}
          onClearInstrument={clearInstrument}
          onClearBeatGroup={clearBeatGroup}
          onClearAll={clearAll}
        />
      </div>
      <FunButtons />
    </div>
  );
}

export default App;
