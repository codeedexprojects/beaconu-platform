"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, Award } from "lucide-react";
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
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const accreditationItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  year: z.string().optional(),
  description: z.string().optional(),
});

const accreditationsTabSchema = z.object({
  items: z.array(accreditationItemSchema).optional(),
});

type AccreditationsTabData = z.infer<typeof accreditationsTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function AccreditationsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <Award className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No accreditations yet — click below to add your first one.
      </span>
    </div>
  );
}

export function AccreditationsTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<AccreditationsTabData>({
    resolver: zodResolver(accreditationsTabSchema as any),
    values: payload,
  });

  const itemsArray = useFieldArray({
    control: control as any,
    name: "items",
  });

  const watchedItems = watch("items") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">
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
            disabled={isLastItemIncomplete(watchedItems, "name")}
            onClick={() =>
              itemsArray.append({ name: "", year: "", description: "" })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Accreditation
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {itemsArray.fields.length === 0 ? (
            <AccreditationsEmptyState />
          ) : (
            <div className="space-y-3">
              {itemsArray.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-start border p-3 rounded-lg bg-muted/5"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <Input
                          className="flex-1"
                          placeholder="Name (e.g. NAAC A++)"
                          {...register(`items.${idx}.name`)}
                        />
                        {errors.items?.[idx]?.name && (
                          <p className="text-xs text-destructive">
                            {errors.items[idx]?.name?.message}
                          </p>
                        )}
                      </div>
                      <Input
                        className="w-32"
                        placeholder="Year (e.g. 2023)"
                        {...register(`items.${idx}.year`)}
                      />
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Description (optional)"
                      {...register(`items.${idx}.description`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteIndex(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteIndex !== null}
        title="Remove Accreditation"
        description="Remove this accreditation? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => {
          if (deleteIndex === null) return;
          itemsArray.remove(deleteIndex);
          setDeleteIndex(null);
        }}
      />
    </div>
  );
}
