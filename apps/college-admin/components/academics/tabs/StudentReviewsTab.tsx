"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function StudentReviewsTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Overall Student Satisfaction Rating (1-5)</Label>
        <Input
          type="number"
          placeholder="e.g. 4.5"
          value={payload.overallRating || ""}
          onChange={(e) =>
            onChange({
              overallRating: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}
