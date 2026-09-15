"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { canonicalIndiaState, getIndiaStates } from "@beaconu/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INDIA_STATES = getIndiaStates();

interface IndiaStateSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function IndiaStateSelect({
  value,
  onChange,
  disabled,
  placeholder = "Select state",
  id,
  className,
}: IndiaStateSelectProps) {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? INDIA_STATES.filter((s) => s.label.toLowerCase().includes(query))
      : INDIA_STATES;
  }, [search]);

  // Radix moves focus onto items as the pointer hovers them; send typing back
  // to the search box instead of Radix's jump-to-item typeahead.
  function redirectTyping(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target === searchRef.current) return;
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      setSearch((s) => s + event.key);
      searchRef.current?.focus();
    } else if (event.key === "Backspace") {
      event.preventDefault();
      setSearch((s) => s.slice(0, -1));
      searchRef.current?.focus();
    }
  }

  return (
    <Select
      value={canonicalIndiaState(value) ?? (value || undefined)}
      onValueChange={onChange}
      disabled={disabled}
      onOpenChange={(open) => {
        if (open) setTimeout(() => searchRef.current?.focus(), 0);
        else setSearch("");
      }}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent onKeyDown={redirectTyping}>
        <div className="flex items-center gap-2 border-b px-2 pb-1.5 mb-1">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Search state"
            className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {options.map((state) => (
          <SelectItem key={state.value} value={state.value}>
            {state.label}
          </SelectItem>
        ))}
        {options.length === 0 && (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">
            No state found
          </p>
        )}
      </SelectContent>
    </Select>
  );
}
