import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconSectionHeaderProps {
  icon: LucideIcon;
  title: string;
  subLabel?: string;
  colorClassName?: string;
  className?: string;
}

export function IconSectionHeader({
  icon: Icon,
  title,
  subLabel,
  colorClassName,
  className,
}: IconSectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-headerTeal/10 text-headerTeal-dark",
          colorClassName,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        {subLabel ? (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-headerTeal">
            {subLabel}
          </p>
        ) : null}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
    </div>
  );
}
