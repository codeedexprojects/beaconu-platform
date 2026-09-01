"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Trash2, Library } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const libraryAssetsTabSchema = z.object({
  libraryIds: z.array(z.string()).optional(),
});

type LibraryAssetsTabData = z.infer<typeof libraryAssetsTabSchema>;

function LinkedLibrariesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <Library className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No libraries linked yet — select one above to add it here.
      </span>
    </div>
  );
}

export function LibraryAssetsTab({
  payload,
  onChange,
  libraries,
}: {
  payload: any;
  onChange: (updates: any) => void;
  libraries: any[];
}) {
  const [unlinkTarget, setUnlinkTarget] = useState<string | null>(null);

  const { watch, setValue } = useForm<LibraryAssetsTabData>({
    resolver: zodResolver(libraryAssetsTabSchema as any),
    values: payload,
  });

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  const linkedIds: string[] = watch("libraryIds") || [];

  return (
    <div className="space-y-6">
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Linked Libraries</CardTitle>
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
                        setValue("libraryIds", next, { shouldDirty: true });
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
          <CardTitle className="text-lg font-bold">Currently Linked</CardTitle>
          <CardDescription>
            Libraries currently shown on this course&apos;s Library tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {linkedIds.length === 0 ? (
            <LinkedLibrariesEmptyState />
          ) : (
            <div className="space-y-2">
              {linkedIds.map((libraryId: string) => {
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
                          : (library.department?.name ?? "Department Library")}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setUnlinkTarget(libraryId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={unlinkTarget !== null}
        title="Unlink Library"
        description="Remove this library from the course? This cannot be undone."
        confirmLabel="Unlink"
        variant="destructive"
        onCancel={() => setUnlinkTarget(null)}
        onConfirm={() => {
          if (!unlinkTarget) return;
          setValue(
            "libraryIds",
            linkedIds.filter((id) => id !== unlinkTarget),
            { shouldDirty: true },
          );
          setUnlinkTarget(null);
        }}
      />
    </div>
  );
}
