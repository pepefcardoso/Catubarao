import * as React from "react";
import { cn } from "../lib/utils";

export interface StepIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  current: number;
  total: number;
  labels: string[];
}

export function StepIndicator({ current, total, labels, className, ...props }: StepIndicatorProps) {
  const steps = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className={cn("flex w-full max-w-xs mx-auto items-start justify-between", className)} {...props}>
      {steps.map((step, index) => {
        const isActive = current >= step;
        const isPast = current > step;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step}>
            {/* Dot and Label */}
            <div className="flex flex-col items-center relative z-10 w-20">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-background text-muted-foreground"
                )}
              >
                {step}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {labels[index]}
              </span>
            </div>

            {/* Connecting Line */}
            {!isLast && (
              <div className="flex-1 h-[2px] mt-4 mx-2 z-0 bg-muted">
                <div
                  className={cn(
                    "h-full bg-primary transition-all duration-300",
                    isPast ? "w-full" : "w-0"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
