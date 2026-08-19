"use client";

import { cn } from "@/lib/utils";

interface SegmentedToggleOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedToggleOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  name?: string;
  className?: string;
}

const GRID_COLS_CLASS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  name,
  className,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn(
        "grid gap-1 rounded-full bg-field p-1",
        GRID_COLS_CLASS[options.length] ?? "grid-cols-2",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full py-2.5 text-sm font-medium transition-colors",
              selected
                ? "bg-accentOrange text-accentOrange-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
