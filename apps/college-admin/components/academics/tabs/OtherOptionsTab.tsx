"use client";

import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function OtherOptionsTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="block font-bold">Related Pathways / Courses</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const next = [
              ...(getActiveTabPayload().list || []),
              { courseName: "", duration: "" },
            ];
            updateActiveTabPayload({ list: next });
          }}
        >
          Add Course Lineage
        </Button>
      </div>
      {(getActiveTabPayload().list || []).map((c: any, idx: number) => (
        <div
          key={idx}
          className="flex gap-2 items-center border p-3 rounded-lg bg-muted/10"
        >
          <Input
            placeholder="Course Name"
            value={c.courseName || ""}
            onChange={(e) => {
              const next = [...(getActiveTabPayload().list || [])];
              next[idx].courseName = e.target.value;
              updateActiveTabPayload({ list: next });
            }}
          />
          <Input
            placeholder="Duration"
            value={c.duration || ""}
            onChange={(e) => {
              const next = [...(getActiveTabPayload().list || [])];
              next[idx].duration = e.target.value;
              updateActiveTabPayload({ list: next });
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              const next = (getActiveTabPayload().list || []).filter(
                (_: any, i: number) => i !== idx,
              );
              updateActiveTabPayload({ list: next });
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}
