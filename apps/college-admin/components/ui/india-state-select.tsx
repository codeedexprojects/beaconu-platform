"use client";

import { getIndiaStates } from "@beaconu/utils";
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
}

export function IndiaStateSelect({
  value,
  onChange,
  disabled,
  placeholder = "Select state",
}: IndiaStateSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {INDIA_STATES.map((state) => (
          <SelectItem key={state.value} value={state.value}>
            {state.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
