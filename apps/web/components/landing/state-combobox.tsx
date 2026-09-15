"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { canonicalIndiaState, getIndiaStates } from "@beaconu/utils";
import { cn } from "@/lib/utils";

const INDIA_STATES = getIndiaStates().map((s) => s.value);

interface StateComboboxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function StateCombobox({
  id,
  value,
  onChange,
  className,
  placeholder = "Search state",
}: StateComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? INDIA_STATES.filter((s) => s.toLowerCase().includes(q))
      : INDIA_STATES;
  }, [query]);

  function select(state: string) {
    onChange(state);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={id ? `${id}-listbox` : undefined}
        autoComplete="off"
        value={open ? query : (canonicalIndiaState(value) ?? value)}
        placeholder={open && value ? value : placeholder}
        onFocus={() => {
          setOpen(true);
          setHighlight(0);
        }}
        onBlur={() => {
          setOpen(false);
          setQuery("");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, options.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && open && options[highlight]) {
            e.preventDefault();
            select(options[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
            setQuery("");
          }
        }}
        className={cn(className, "pr-10")}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      {open && (
        <ul
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-[10px] border border-white/15 bg-navy-dark py-1 shadow-xl"
        >
          {options.length === 0 ? (
            <li className="px-4 py-2 text-sm text-white/50">No state found</li>
          ) : (
            options.map((state, index) => (
              <li
                key={state}
                role="option"
                aria-selected={state === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(state);
                }}
                onMouseEnter={() => setHighlight(index)}
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm text-white/85",
                  index === highlight && "bg-white/10",
                  state === value && "font-semibold text-white",
                )}
              >
                {state}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
