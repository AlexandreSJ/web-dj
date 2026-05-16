interface TransportBarProps {
  playing: boolean;
  bpm: number;
  volume: number;
  userCount: number;
  onPlayToggle: () => void;
  onBpmChange: (bpm: number) => void;
  onVolumeChange: (vol: number) => void;
}

export function TransportBar({ playing, bpm, volume, userCount, onPlayToggle, onBpmChange, onVolumeChange }: TransportBarProps) {
  return (
    <div className="transport-bar">
      <button className={playing ? "playing" : ""} onClick={onPlayToggle}>
        {playing ? "Stop" : "Play"}
      </button>
      <div className="bpm-control">
        <label>BPM</label>
        <input
          type="range"
          min={80}
          max={180}
          step={10}
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
        />
        <span className="bpm-value">{bpm}</span>
      </div>
      <div className="volume-control">
        <label>VOL</label>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
        />
        <span className="bpm-value">{volume}%</span>
      </div>
      <div className="user-count">
        <span className="dot" />
        {userCount} {userCount === 1 ? "user" : "users"}
      </div>
    </div>
  );
}
