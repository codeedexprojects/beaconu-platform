"use client";

import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function GradingTab({
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
      <div className="space-y-2">
        <Label>Grading Scale Title</Label>
        <Input
          placeholder="e.g. Grading Scale"
          value={getActiveTabPayload().grading_scale?.title || ""}
          onChange={(e) =>
            updateActiveTabPayload({
              grading_scale: {
                ...(getActiveTabPayload().grading_scale || {}),
                title: e.target.value,
              },
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Table Columns (comma-separated)</Label>
        <Input
          placeholder="e.g. Percentage of Marks, Grade, Grade Point"
          value={(getActiveTabPayload().grading_scale?.columns || []).join(
            ", ",
          )}
          onChange={(e) =>
            updateActiveTabPayload({
              grading_scale: {
                ...(getActiveTabPayload().grading_scale || {}),
                columns: e.target.value.split(","),
              },
            })
          }
          onBlur={(e) =>
            updateActiveTabPayload({
              grading_scale: {
                ...(getActiveTabPayload().grading_scale || {}),
                columns: e.target.value
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean),
              },
            })
          }
        />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Grade Rows</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const rows = [
                ...(getActiveTabPayload().grading_scale?.rows || []),
                {
                  percentage_range: "",
                  grade: "",
                  grade_color: "green",
                  grade_point: 0,
                },
              ];
              updateActiveTabPayload({
                grading_scale: {
                  ...(getActiveTabPayload().grading_scale || {}),
                  rows,
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
        </div>
        {(getActiveTabPayload().grading_scale?.rows || []).map(
          (row: any, ri: number) => (
            <div key={ri} className="flex gap-2 items-center">
              <Input
                placeholder="Range (e.g. 90% - 100%)"
                value={row.percentage_range || ""}
                onChange={(e) => {
                  const rows = [
                    ...(getActiveTabPayload().grading_scale?.rows || []),
                  ];
                  rows[ri] = {
                    ...rows[ri],
                    percentage_range: e.target.value,
                  };
                  updateActiveTabPayload({
                    grading_scale: {
                      ...(getActiveTabPayload().grading_scale || {}),
                      rows,
                    },
                  });
                }}
              />
              <Input
                placeholder="Grade (e.g. O)"
                className="w-20"
                value={row.grade || ""}
                onChange={(e) => {
                  const rows = [
                    ...(getActiveTabPayload().grading_scale?.rows || []),
                  ];
                  rows[ri] = {
                    ...rows[ri],
                    grade: e.target.value,
                  };
                  updateActiveTabPayload({
                    grading_scale: {
                      ...(getActiveTabPayload().grading_scale || {}),
                      rows,
                    },
                  });
                }}
              />
              <Select
                value={row.grade_color || "green"}
                onValueChange={(val) => {
                  const rows = [
                    ...(getActiveTabPayload().grading_scale?.rows || []),
                  ];
                  rows[ri] = {
                    ...rows[ri],
                    grade_color: val,
                  };
                  updateActiveTabPayload({
                    grading_scale: {
                      ...(getActiveTabPayload().grading_scale || {}),
                      rows,
                    },
                  });
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Points"
                className="w-20"
                step="0.1"
                value={row.grade_point ?? ""}
                onChange={(e) => {
                  const rows = [
                    ...(getActiveTabPayload().grading_scale?.rows || []),
                  ];
                  rows[ri] = {
                    ...rows[ri],
                    grade_point: e.target.value,
                  };
                  updateActiveTabPayload({
                    grading_scale: {
                      ...(getActiveTabPayload().grading_scale || {}),
                      rows,
                    },
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const rows = (
                    getActiveTabPayload().grading_scale?.rows || []
                  ).filter((_: any, i: number) => i !== ri);
                  updateActiveTabPayload({
                    grading_scale: {
                      ...(getActiveTabPayload().grading_scale || {}),
                      rows,
                    },
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
