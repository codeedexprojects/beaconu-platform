import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-primary/20 bg-primary/10 text-white",
        secondary: "border border-white/10 bg-white/5 text-white/85",
        destructive:
          "border border-destructive/20 bg-destructive/10 text-red-400",
        outline: "border border-white/10 text-white/90 bg-transparent",
        success:
          "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        warning: "border border-amber-500/20 bg-amber-500/10 text-amber-400",
        info: "border border-blue-500/20 bg-blue-500/10 text-blue-400",
        orange: "border border-orange-500/20 bg-orange-500/10 text-orange-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
