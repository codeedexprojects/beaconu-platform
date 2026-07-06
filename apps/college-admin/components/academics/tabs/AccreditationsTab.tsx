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

export function AccreditationsTab({
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
            <CardTitle className="text-lg font-bold text-indigo-950">
              Accreditations & Approvals
            </CardTitle>
            <CardDescription>
              Ranking bodies, accreditation grades, and approval years for this
              course.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              addTabListItem("items", {
                name: "",
                year: "",
                description: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Accreditation
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {getTabList("items").length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No accreditations added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {getTabList("items").map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 items-start border p-3 rounded-lg bg-muted/5"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        className="flex-1"
                        placeholder="Name (e.g. NAAC A++)"
                        value={item.name || ""}
                        onChange={(e) =>
                          updateTabListItem("items", idx, {
                            name: e.target.value,
                          })
                        }
                      />
                      <Input
                        className="w-32"
                        placeholder="Year (e.g. 2023)"
                        value={item.year || ""}
                        onChange={(e) =>
                          updateTabListItem("items", idx, {
                            year: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Description (optional)"
                      value={item.description || ""}
                      onChange={(e) =>
                        updateTabListItem("items", idx, {
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTabListItem("items", idx)}
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
