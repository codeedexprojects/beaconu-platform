"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, Wrench, FlaskConical, Building2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CLASS_TIMING_DAYS } from "@/components/academics/constants";

const dayTimingSchema = z.object({
  day: z.string().min(1),
  closed: z.boolean().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
});

const bonusCertificationSchema = z.object({
  title: z.string().optional(),
  tag: z.string().optional(),
  link: z.string().optional(),
  description: z.string().optional(),
});

const facilitiesTimingsTabSchema = z.object({
  class_timings: z.array(dayTimingSchema).optional(),
  industry_tools: z.array(z.string()).optional(),
  lab_facilities: z.array(z.string()).optional(),
  classroom_facilities: z.array(z.string()).optional(),
  bonus_certification: bonusCertificationSchema.optional(),
});

type FacilitiesTimingsTabData = z.infer<typeof facilitiesTimingsTabSchema>;

// Blocks the "Add" button for flat string arrays while the last string is empty.
function isLastStringIncomplete(items: string[]): boolean {
  if (!items || items.length === 0) return false;
  return !String(items[items.length - 1] ?? "").trim();
}

function FacilitiesEmptyState({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Wrench;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <Icon className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No {label} yet — click above to add your first one.
      </span>
    </div>
  );
}

function normalizeClassTimings(existing: any[] | undefined) {
  const list = Array.isArray(existing) ? existing : [];
  return CLASS_TIMING_DAYS.map((day) => {
    const found = list.find((t: any) => t?.day === day);
    return found
      ? {
          day,
          closed: !!found.closed,
          start: found.start || "",
          end: found.end || "",
        }
      : { day, closed: false, start: "", end: "" };
  });
}

export function FacilitiesTimingsTab({
  payload,
  onChange,
  uploadingField,
  onFieldUpload,
}: {
  payload: any;
  onChange: (updates: any) => void;
  uploadingField: string | null;
  onFieldUpload: (
    file: File | null,
    fieldKey: string,
    s3PathSuffix: string,
    onSuccess: (url: string) => void,
  ) => void;
}) {
  const [deleteToolIdx, setDeleteToolIdx] = useState<number | null>(null);
  const [deleteLabIdx, setDeleteLabIdx] = useState<number | null>(null);
  const [deleteClassroomIdx, setDeleteClassroomIdx] = useState<number | null>(
    null,
  );

  const { register, control, watch, setValue } =
    useForm<FacilitiesTimingsTabData>({
      resolver: zodResolver(facilitiesTimingsTabSchema as any),
      values: {
        ...payload,
        class_timings: normalizeClassTimings(payload?.class_timings),
      },
    });

  const industryToolsArray = useFieldArray({
    control: control as any,
    name: "industry_tools",
  });
  const labFacilitiesArray = useFieldArray({
    control: control as any,
    name: "lab_facilities",
  });
  const classroomFacilitiesArray = useFieldArray({
    control: control as any,
    name: "classroom_facilities",
  });

  const watchedClassTimings: any[] = watch("class_timings") || [];
  const watchedIndustryTools: string[] = watch("industry_tools") || [];
  const watchedLabFacilities: string[] = watch("lab_facilities") || [];
  const watchedClassroomFacilities: string[] =
    watch("classroom_facilities") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="font-bold">Class Timings</Label>
        <div className="space-y-2">
          {CLASS_TIMING_DAYS.map((day) => {
            const dayIdx = watchedClassTimings.findIndex(
              (t: any) => t?.day === day,
            );
            if (dayIdx === -1) return null;
            const entry = watchedClassTimings[dayIdx] || {};
            return (
              <div
                key={day}
                className="flex flex-wrap items-center gap-3 border p-2 rounded-lg bg-muted/5"
              >
                <span className="w-24 text-sm font-medium">{day}</span>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={!!entry.closed}
                    onChange={(e) =>
                      setValue(
                        `class_timings.${dayIdx}.closed`,
                        e.target.checked,
                      )
                    }
                  />
                  Closed
                </label>
                {!entry.closed && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      className="w-32"
                      {...register(`class_timings.${dayIdx}.start`)}
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="time"
                      className="w-32"
                      {...register(`class_timings.${dayIdx}.end`)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Industry Tools</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastStringIncomplete(watchedIndustryTools)}
            onClick={() => industryToolsArray.append("")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Industry Tool
          </Button>
        </div>
        {industryToolsArray.fields.length === 0 ? (
          <FacilitiesEmptyState label="industry tools" icon={Wrench} />
        ) : (
          industryToolsArray.fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. Python, Docker, Tableau"
                {...register(`industry_tools.${idx}`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteToolIdx(idx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Lab Facilities</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastStringIncomplete(watchedLabFacilities)}
            onClick={() => labFacilitiesArray.append("")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Lab Facility
          </Button>
        </div>
        {labFacilitiesArray.fields.length === 0 ? (
          <FacilitiesEmptyState label="lab facilities" icon={FlaskConical} />
        ) : (
          labFacilitiesArray.fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. Advanced IoT & Robotics Lab"
                {...register(`lab_facilities.${idx}`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteLabIdx(idx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Classroom Facilities</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastStringIncomplete(watchedClassroomFacilities)}
            onClick={() => classroomFacilitiesArray.append("")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Classroom Facility
          </Button>
        </div>
        {classroomFacilitiesArray.fields.length === 0 ? (
          <FacilitiesEmptyState label="classroom facilities" icon={Building2} />
        ) : (
          classroomFacilitiesArray.fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. Smart Projector, Centrally Air-Conditioned"
                {...register(`classroom_facilities.${idx}`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteClassroomIdx(idx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <h4 className="font-bold text-sm text-foreground">
          Bonus Certification
        </h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input
              placeholder="e.g. Tally Prime Certification"
              {...register("bonus_certification.title")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tag</Label>
            <Input
              placeholder="e.g. BONUS CERTIFICATION"
              {...register("bonus_certification.tag")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Certification File</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                disabled={uploadingField === "bonus_certification_link"}
                onChange={(e) =>
                  onFieldUpload(
                    e.target.files?.[0] ?? null,
                    "bonus_certification_link",
                    "bonus-certification/link",
                    (url) => setValue("bonus_certification.link", url),
                  )
                }
              />
            </div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">Description</Label>
            <Input
              placeholder="e.g. Included with Finance specialization at no extra cost."
              {...register("bonus_certification.description")}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteToolIdx !== null}
        title="Remove Industry Tool"
        description="Remove this industry tool? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteToolIdx(null)}
        onConfirm={() => {
          if (deleteToolIdx === null) return;
          industryToolsArray.remove(deleteToolIdx);
          setDeleteToolIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteLabIdx !== null}
        title="Remove Lab Facility"
        description="Remove this lab facility? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteLabIdx(null)}
        onConfirm={() => {
          if (deleteLabIdx === null) return;
          labFacilitiesArray.remove(deleteLabIdx);
          setDeleteLabIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteClassroomIdx !== null}
        title="Remove Classroom Facility"
        description="Remove this classroom facility? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteClassroomIdx(null)}
        onConfirm={() => {
          if (deleteClassroomIdx === null) return;
          classroomFacilitiesArray.remove(deleteClassroomIdx);
          setDeleteClassroomIdx(null);
        }}
      />
    </div>
  );
}
