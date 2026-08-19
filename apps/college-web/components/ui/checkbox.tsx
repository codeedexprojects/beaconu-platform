import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <label className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <span className="pointer-events-none absolute inset-0 rounded-md border-2 border-border bg-background transition-colors peer-checked:border-accentOrange peer-checked:bg-accentOrange peer-focus-visible:ring-2 peer-focus-visible:ring-accentOrange/40" />
        <Check className="pointer-events-none relative h-3.5 w-3.5 text-accentOrange-foreground opacity-0 transition-opacity peer-checked:opacity-100" />
      </span>
    </label>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
