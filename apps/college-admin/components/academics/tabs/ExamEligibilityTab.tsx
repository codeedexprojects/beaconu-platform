"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createTabListHelpers } from "@/components/academics/shared/tabListHelpers";

export function ExamEligibilityTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);
  const { getTabList, addTabListItem, removeTabListItem, updateTabListItem } =
    createTabListHelpers(getActiveTabPayload, updateActiveTabPayload);

  return (
    <div className="space-y-6">
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">
              Entrance Exam Eligibility
            </CardTitle>
            <CardDescription>
              National/state entrance exams accepted and the qualifying marks
              required.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              addTabListItem("exams", {
                name: "",
                level: "",
                min_qualifying_marks: "",
                description: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Exam
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {getTabList("exams").length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No entrance exams added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {getTabList("exams").map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 items-start border p-3 rounded-lg bg-muted/5"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        className="flex-1"
                        placeholder="Exam Name (e.g. JEE Main)"
                        value={item.name || ""}
                        onChange={(e) =>
                          updateTabListItem("exams", idx, {
                            name: e.target.value,
                          })
                        }
                      />
                      <Input
                        className="w-40"
                        placeholder="Level (National/State)"
                        value={item.level || ""}
                        onChange={(e) =>
                          updateTabListItem("exams", idx, {
                            level: e.target.value,
                          })
                        }
                      />
                      <Input
                        className="w-48"
                        placeholder="Min Qualifying Marks (e.g. 60%ile)"
                        value={item.min_qualifying_marks || ""}
                        onChange={(e) =>
                          updateTabListItem("exams", idx, {
                            min_qualifying_marks: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Description (optional)"
                      value={item.description || ""}
                      onChange={(e) =>
                        updateTabListItem("exams", idx, {
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTabListItem("exams", idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
