"use client";

import { useMemo } from "react";
import { getIndiaDistricts } from "@beaconu/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IndiaDistrictSelectProps {
  stateName: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function IndiaDistrictSelect({
  stateName,
  value,
  onChange,
  disabled,
  placeholder = "Select district",
}: IndiaDistrictSelectProps) {
  const districts = useMemo(() => getIndiaDistricts(stateName), [stateName]);

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled || !stateName}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={!stateName ? "Select state first" : placeholder}
        />
      </SelectTrigger>
      <SelectContent>
        {districts.map((district) => (
          <SelectItem key={district.value} value={district.value}>
            {district.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
