import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-full border-0 bg-field px-5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:bg-field-focus focus-visible:ring-2 focus-visible:ring-accentOrange/40 disabled:cursor-not-allowed disabled:opacity-50",
          invalid && "ring-1 ring-destructive/60",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
