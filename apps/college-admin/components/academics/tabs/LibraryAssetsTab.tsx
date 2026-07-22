"use client";

import { Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LibraryAssetsTab({
  payload,
  onChange,
  libraries,
}: {
  payload: any;
  onChange: (updates: any) => void;
  libraries: any[];
}) {
  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);

  return (
    <div className="space-y-6">
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-indigo-950">
            Linked Libraries
          </CardTitle>
          <CardDescription>
            Select which of the college&apos;s libraries apply to students of
            this course. Manage library details under Setup &rarr; Libraries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {libraries.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No libraries added yet &mdash; add one under Setup &rarr;
              Libraries first.
            </p>
          ) : (
            <div className="space-y-2">
              {libraries.map((library) => {
                const linkedIds: string[] =
                  getActiveTabPayload().libraryIds || [];
                const isLinked = linkedIds.includes(library.id);
                return (
                  <label
                    key={library.id}
                    className="flex items-center gap-3 border p-3 rounded-lg bg-muted/5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={isLinked}
                      onChange={() => {
                        const next = isLinked
                          ? linkedIds.filter((id) => id !== library.id)
                          : [...linkedIds, library.id];
                        updateActiveTabPayload({
                          libraryIds: next,
                        });
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{library.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {library.type === "central"
                          ? "Central Library"
                          : (library.department?.name ?? "Department Library")}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-indigo-950">
            Currently Linked
          </CardTitle>
          <CardDescription>
            Libraries currently shown on this course&apos;s Library tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(getActiveTabPayload().libraryIds || []).length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No libraries linked yet.
            </p>
          ) : (
            <div className="space-y-2">
              {(getActiveTabPayload().libraryIds || []).map(
                (libraryId: string) => {
                  const library = libraries.find((l) => l.id === libraryId);
                  if (!library) return null;
                  return (
                    <div
                      key={libraryId}
                      className="flex items-center justify-between border p-3 rounded-lg bg-muted/5"
                    >
                      <div>
                        <p className="text-sm font-semibold">{library.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {library.type === "central"
                            ? "Central Library"
                            : (library.department?.name ??
                              "Department Library")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const linkedIds: string[] =
                            getActiveTabPayload().libraryIds || [];
                          updateActiveTabPayload({
                            libraryIds: linkedIds.filter(
                              (id) => id !== libraryId,
                            ),
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
