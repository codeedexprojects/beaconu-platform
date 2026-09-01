"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, Handshake, FileText, CalendarDays } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const legalDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().optional(),
});

const allianceActivitySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  image: z.string().optional(),
  link: z.string().optional(),
});

const allianceDetailsSchema = z.object({
  category: z.string().optional(),
  about: z.string().optional(),
  collaboration_impact: z.string().optional(),
  key_focus_areas: z.array(z.string()).optional(),
  legal_documents: z.array(legalDocumentSchema).optional(),
  alliance_activities: z
    .object({
      happenings_link: z.string().optional(),
      activities: z.array(allianceActivitySchema).optional(),
    })
    .optional(),
});

const allianceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  cover_image: z.string().optional(),
  logo: z.string().optional(),
  details: allianceDetailsSchema.optional(),
});

const alliancesTiesTabSchema = z.object({
  alliances: z.array(allianceSchema).optional(),
});

type AlliancesTiesTabData = z.infer<typeof alliancesTiesTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

// Blocks the "Add" button for flat string arrays while the last string is empty.
function isLastStringIncomplete(items: string[]): boolean {
  if (!items || items.length === 0) return false;
  return !String(items[items.length - 1] ?? "").trim();
}

function AlliancesEmptyState({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Handshake;
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

// One alliance — has three sibling nested arrays (details.key_focus_areas[],
// details.legal_documents[], details.alliance_activities.activities[]), so it
// needs its own scoped useFieldArrays. Mirrors ClubsGroupsTab's `ClubFields`
// pattern, extended with one extra sibling array.
function AllianceFields({
  allianceIdx,
  control,
  register,
  watch,
  setValue,
  errors,
  onRemoveAlliance,
  uploadingField,
  onFieldUpload,
}: {
  allianceIdx: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  onRemoveAlliance: () => void;
  uploadingField: string | null;
  onFieldUpload: (
    file: File | null,
    fieldKey: string,
    s3PathSuffix: string,
    onSuccess: (url: string) => void,
  ) => void;
}) {
  const [deleteFocusAreaIdx, setDeleteFocusAreaIdx] = useState<number | null>(
    null,
  );
  const [deleteDocumentIdx, setDeleteDocumentIdx] = useState<number | null>(
    null,
  );
  const [deleteActivityIdx, setDeleteActivityIdx] = useState<number | null>(
    null,
  );

  const focusAreasArray = useFieldArray({
    control,
    name: `alliances.${allianceIdx}.details.key_focus_areas`,
  });
  const legalDocumentsArray = useFieldArray({
    control,
    name: `alliances.${allianceIdx}.details.legal_documents`,
  });
  const activitiesArray = useFieldArray({
    control,
    name: `alliances.${allianceIdx}.details.alliance_activities.activities`,
  });

  const watchedFocusAreas: string[] =
    watch(`alliances.${allianceIdx}.details.key_focus_areas`) || [];
  const watchedDocuments: any[] =
    watch(`alliances.${allianceIdx}.details.legal_documents`) || [];
  const watchedActivities: any[] =
    watch(`alliances.${allianceIdx}.details.alliance_activities.activities`) ||
    [];
  const allianceErrors = errors?.alliances?.[allianceIdx];

  return (
    <div className="space-y-3 border p-4 rounded-lg bg-muted/10">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 space-y-1">
          <Input
            placeholder="Partner Name (e.g. Baby Memorial Hospital)"
            {...register(`alliances.${allianceIdx}.name`)}
          />
          {allianceErrors?.name && (
            <p className="text-xs text-destructive">
              {allianceErrors.name.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemoveAlliance}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Controller
            name={`alliances.${allianceIdx}.details.category`}
            control={control}
            render={({ field: categoryField }) => (
              <Select
                value={categoryField.value || ""}
                onValueChange={(value) => categoryField.onChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Industrial Collaboration">
                    Industrial Collaboration
                  </SelectItem>
                  <SelectItem value="Academic & Research">
                    Academic & Research
                  </SelectItem>
                  <SelectItem value="Own Hospital">Own Hospital</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Cover Image (banner shown on partner page)
          </Label>
          <ImageUpload
            value={watch(`alliances.${allianceIdx}.cover_image`) || ""}
            onChange={(url) =>
              setValue(`alliances.${allianceIdx}.cover_image`, url)
            }
            context={`alliances-ties/cover-image-${allianceIdx}`}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Logo (small emblem/icon)
          </Label>
          <ImageUpload
            value={watch(`alliances.${allianceIdx}.logo`) || ""}
            onChange={(url) => setValue(`alliances.${allianceIdx}.logo`, url)}
            context={`alliances-ties/logo-${allianceIdx}`}
          />
        </div>
      </div>

      <Textarea
        placeholder="About this alliance..."
        {...register(`alliances.${allianceIdx}.details.about`)}
      />
      <Textarea
        placeholder="Collaboration impact..."
        {...register(`alliances.${allianceIdx}.details.collaboration_impact`)}
      />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold">Key Focus Areas</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastStringIncomplete(watchedFocusAreas)}
            onClick={() => focusAreasArray.append("")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Focus Area
          </Button>
        </div>
        {focusAreasArray.fields.length === 0 ? (
          <AlliancesEmptyState label="focus areas" icon={Handshake} />
        ) : (
          focusAreasArray.fields.map((field, fIdx) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. Clinical Rotations for Nursing Students"
                {...register(
                  `alliances.${allianceIdx}.details.key_focus_areas.${fIdx}`,
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteFocusAreaIdx(fIdx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold">Legal & Documentation</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedDocuments, "title")}
            onClick={() => legalDocumentsArray.append({ title: "", url: "" })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Document
          </Button>
        </div>
        {legalDocumentsArray.fields.length === 0 ? (
          <AlliancesEmptyState label="documents" icon={FileText} />
        ) : (
          legalDocumentsArray.fields.map((field, dIdx) => (
            <div key={field.id} className="space-y-1">
              <div className="grid grid-cols-[2fr_2fr_auto] gap-2 items-center">
                <Input
                  placeholder="Document Title"
                  {...register(
                    `alliances.${allianceIdx}.details.legal_documents.${dIdx}.title`,
                  )}
                />
                <div className="space-y-1">
                  <Input
                    type="file"
                    accept="application/pdf"
                    disabled={
                      uploadingField ===
                      `alliance_legal_doc_${allianceIdx}_${dIdx}`
                    }
                    onChange={(e) =>
                      onFieldUpload(
                        e.target.files?.[0] ?? null,
                        `alliance_legal_doc_${allianceIdx}_${dIdx}`,
                        `alliances/${allianceIdx}/legal_documents/${dIdx}`,
                        (url) =>
                          setValue(
                            `alliances.${allianceIdx}.details.legal_documents.${dIdx}.url`,
                            url,
                          ),
                      )
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteDocumentIdx(dIdx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {allianceErrors?.details?.legal_documents?.[dIdx]?.title && (
                <p className="text-xs text-destructive">
                  {allianceErrors.details.legal_documents[dIdx]?.title?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Alliance Activities</Label>
        <Input
          placeholder="'View Happenings' link"
          {...register(
            `alliances.${allianceIdx}.details.alliance_activities.happenings_link`,
          )}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedActivities, "title")}
            onClick={() =>
              activitiesArray.append({
                id: "",
                title: "",
                image: "",
                link: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Activity
          </Button>
        </div>
        {activitiesArray.fields.length === 0 ? (
          <AlliancesEmptyState label="activities" icon={CalendarDays} />
        ) : (
          activitiesArray.fields.map((field, acIdx) => (
            <div key={field.id} className="space-y-1">
              <div className="grid grid-cols-[2fr_2fr_2fr_auto] gap-2 items-center">
                <Input
                  placeholder="Activity Title"
                  {...register(
                    `alliances.${allianceIdx}.details.alliance_activities.activities.${acIdx}.title`,
                  )}
                />
                <ImageUpload
                  value={
                    watch(
                      `alliances.${allianceIdx}.details.alliance_activities.activities.${acIdx}.image`,
                    ) || ""
                  }
                  onChange={(url) =>
                    setValue(
                      `alliances.${allianceIdx}.details.alliance_activities.activities.${acIdx}.image`,
                      url,
                    )
                  }
                  context={`alliances-ties/activity-image-${allianceIdx}-${acIdx}`}
                />
                <Input
                  placeholder="Activity link"
                  {...register(
                    `alliances.${allianceIdx}.details.alliance_activities.activities.${acIdx}.link`,
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteActivityIdx(acIdx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {allianceErrors?.details?.alliance_activities?.activities?.[acIdx]
                ?.title && (
                <p className="text-xs text-destructive">
                  {
                    allianceErrors.details.alliance_activities.activities[acIdx]
                      ?.title?.message
                  }
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteFocusAreaIdx !== null}
        title="Remove Focus Area"
        description="Remove this key focus area? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteFocusAreaIdx(null)}
        onConfirm={() => {
          if (deleteFocusAreaIdx === null) return;
          focusAreasArray.remove(deleteFocusAreaIdx);
          setDeleteFocusAreaIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteDocumentIdx !== null}
        title="Remove Document"
        description="Remove this document? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteDocumentIdx(null)}
        onConfirm={() => {
          if (deleteDocumentIdx === null) return;
          legalDocumentsArray.remove(deleteDocumentIdx);
          setDeleteDocumentIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteActivityIdx !== null}
        title="Remove Activity"
        description="Remove this activity? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteActivityIdx(null)}
        onConfirm={() => {
          if (deleteActivityIdx === null) return;
          activitiesArray.remove(deleteActivityIdx);
          setDeleteActivityIdx(null);
        }}
      />
    </div>
  );
}

export function AlliancesTiesTab({
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
  const [deleteAllianceIdx, setDeleteAllianceIdx] = useState<number | null>(
    null,
  );

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AlliancesTiesTabData>({
    resolver: zodResolver(alliancesTiesTabSchema as any),
    values: payload,
  });

  const alliancesArray = useFieldArray({
    control: control as any,
    name: "alliances",
  });

  const watchedAlliances = watch("alliances") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="block font-bold">
          Industrial & International Partnerships
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLastItemIncomplete(watchedAlliances, "name")}
          onClick={() =>
            alliancesArray.append({
              id: "",
              name: "",
              cover_image: "",
              logo: "",
              details: {
                category: "",
                about: "",
                collaboration_impact: "",
                key_focus_areas: [],
                legal_documents: [],
                alliance_activities: {
                  happenings_link: "",
                  activities: [],
                },
              },
            })
          }
        >
          Add Alliance
        </Button>
      </div>

      {alliancesArray.fields.length === 0 ? (
        <AlliancesEmptyState label="alliances" icon={Handshake} />
      ) : (
        alliancesArray.fields.map((field, idx) => (
          <AllianceFields
            key={field.id}
            allianceIdx={idx}
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            onRemoveAlliance={() => setDeleteAllianceIdx(idx)}
            uploadingField={uploadingField}
            onFieldUpload={onFieldUpload}
          />
        ))
      )}

      <ConfirmDialog
        open={deleteAllianceIdx !== null}
        title="Remove Alliance"
        description="Remove this alliance and all its focus areas, documents, and activities? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteAllianceIdx(null)}
        onConfirm={() => {
          if (deleteAllianceIdx === null) return;
          alliancesArray.remove(deleteAllianceIdx);
          setDeleteAllianceIdx(null);
        }}
      />
    </div>
  );
}
