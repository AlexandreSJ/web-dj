import { STEPS } from "../types";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      {Array.from({ length: STEPS }, (_, i) => (
        <div key={i} className={`step${i === currentStep ? " active" : ""}`} />
      ))}
    </div>
  );
}
