import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
  className?: string;
}

export function Stepper({
  currentStep,
  totalSteps,
  stepLabel,
  className,
}: StepperProps) {
  const percent = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-muted-foreground">
        {stepLabel ?? `Step ${currentStep} of ${totalSteps}`}
      </p>
      <div className="h-1.5 w-full rounded-full bg-field">
        <div
          className="h-full rounded-full bg-headerTeal-dark transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
