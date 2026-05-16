import { useCallback, useState } from "react";
import { startAudio, setBpm, setVolume } from "../audio/engine";

export function useAudioEngine() {
  const [audioStarted, setAudioStarted] = useState(false);

  const init = useCallback(async () => {
    if (audioStarted) return;
    await startAudio();
    setAudioStarted(true);
  }, [audioStarted]);

  const changeBpm = useCallback((bpm: number) => {
    setBpm(bpm);
  }, []);

  const changeVolume = useCallback((value: number) => {
    setVolume(value);
  }, []);

  return { audioStarted, init, changeBpm, changeVolume };
}
