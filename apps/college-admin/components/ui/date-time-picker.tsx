"use client";

import { Input } from "@/components/ui/input";

export interface DateTimePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}

function toParts(value: string): { date: string; time: string } {
  const [date = "", time = ""] = value.split("T");
  return { date, time: time.slice(0, 5) };
}

function toValue(date: string, time: string): string {
  if (!date) return "";
  return `${date}T${time || "00:00"}`;
}

// Plain native date + time inputs, side by side — not a custom Popover +
// Calendar. A calendar widget rendered in a Radix Popover portaled outside
// a Dialog fights the Dialog's focus trap (the popover closes itself right
// after a click registers). Native date/time pickers render as OS-level
// chrome outside the page's DOM/CSS stacking entirely, so they can't hit
// that class of bug — this is the reliable choice for a field inside a
// modal dialog.
export function DateTimePicker({ id, value, onChange }: DateTimePickerProps) {
  const { date, time } = toParts(value);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Input
        id={id}
        type="date"
        value={date}
        onChange={(e) => onChange(toValue(e.target.value, time))}
      />
      <Input
        type="time"
        value={time}
        onChange={(e) => onChange(toValue(date, e.target.value))}
      />
    </div>
  );
}
