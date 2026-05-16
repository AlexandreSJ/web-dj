import { useState, useCallback, useRef } from "react";
import confetti from "canvas-confetti";

export function FunButtons() {
  const [cooldown, setCooldown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fire = useCallback(() => {
    if (cooldown) return;

    confetti({ particleCount: 50, spread: 70, origin: { x: 0.1, y: 0.6 }, colors: ["#00fff2", "#ff00ff", "#39ff14", "#fff700", "#ff6600"] });
    confetti({ particleCount: 50, spread: 70, origin: { x: 0.9, y: 0.6 }, colors: ["#00fff2", "#ff00ff", "#39ff14", "#fff700", "#ff6600"] });
    confetti({ particleCount: 30, spread: 100, startVelocity: 45, origin: { x: 0.5, y: 0.5 }, colors: ["#00fff2", "#ff00ff", "#39ff14", "#fff700", "#ff6600"] });

    setCooldown(true);
    timerRef.current = setTimeout(() => setCooldown(false), 1000);
  }, [cooldown]);

  return (
    <button
      className={`confetti-btn${cooldown ? " on-cooldown" : ""}`}
      onClick={fire}
      disabled={cooldown}
      title="Party!"
    >
      {cooldown ? (
        <svg className="spin" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ) : "🎊"}
    </button>
  );
}
