"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, Users, CalendarDays } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const clubEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  image: z.string().optional(),
  link: z.string().optional(),
});

const clubDetailsSchema = z.object({
  about: z.string().optional(),
  mission: z.string().optional(),
  key_activities: z.array(z.string()).optional(),
  recent_events: z
    .object({
      happenings_link: z.string().optional(),
      events: z.array(clubEventSchema).optional(),
    })
    .optional(),
});

const clubSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  category: z.string().optional(),
  cover_image: z.string().optional(),
  logo: z.string().optional(),
  details: clubDetailsSchema.optional(),
});

const clubsGroupsTabSchema = z.object({
  clubs: z.array(clubSchema).optional(),
});

type ClubsGroupsTabData = z.infer<typeof clubsGroupsTabSchema>;

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

function ClubsEmptyState({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Users;
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

// One club — has two sibling nested arrays (details.key_activities[] and
// details.recent_events.events[]), so it needs its own scoped useFieldArrays.
// Mirrors FinancialAidTab's `PortEntryFields` pattern.
function ClubFields({
  clubIdx,
  control,
  register,
  watch,
  setValue,
  errors,
  onRemoveClub,
}: {
  clubIdx: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  onRemoveClub: () => void;
}) {
  const [deleteActivityIdx, setDeleteActivityIdx] = useState<number | null>(
    null,
  );
  const [deleteEventIdx, setDeleteEventIdx] = useState<number | null>(null);

  const activitiesArray = useFieldArray({
    control,
    name: `clubs.${clubIdx}.details.key_activities`,
  });
  const eventsArray = useFieldArray({
    control,
    name: `clubs.${clubIdx}.details.recent_events.events`,
  });

  const watchedActivities: string[] =
    watch(`clubs.${clubIdx}.details.key_activities`) || [];
  const watchedEvents: any[] =
    watch(`clubs.${clubIdx}.details.recent_events.events`) || [];
  const clubErrors = errors?.clubs?.[clubIdx];

  return (
    <div className="space-y-3 border p-4 rounded-lg bg-muted/10">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 space-y-1">
          <Input
            placeholder="Club Name (e.g. National Service Scheme)"
            {...register(`clubs.${clubIdx}.name`)}
          />
          {clubErrors?.name && (
            <p className="text-xs text-destructive">
              {clubErrors.name.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemoveClub}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Input
            placeholder="Category (e.g. SERVICE)"
            {...register(`clubs.${clubIdx}.category`)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Cover Image (banner shown on club page)
          </Label>
          <ImageUpload
            value={watch(`clubs.${clubIdx}.cover_image`) || ""}
            onChange={(url) => setValue(`clubs.${clubIdx}.cover_image`, url)}
            context={`clubs-groups/cover-image-${clubIdx}`}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Logo (small emblem/icon)
          </Label>
          <ImageUpload
            value={watch(`clubs.${clubIdx}.logo`) || ""}
            onChange={(url) => setValue(`clubs.${clubIdx}.logo`, url)}
            context={`clubs-groups/logo-${clubIdx}`}
          />
        </div>
      </div>

      <Textarea
        placeholder="About this club..."
        {...register(`clubs.${clubIdx}.details.about`)}
      />
      <Textarea
        placeholder="Mission statement..."
        {...register(`clubs.${clubIdx}.details.mission`)}
      />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold">Key Activities</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastStringIncomplete(watchedActivities)}
            onClick={() => activitiesArray.append("")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Activity
          </Button>
        </div>
        {activitiesArray.fields.length === 0 ? (
          <ClubsEmptyState label="key activities" icon={Users} />
        ) : (
          activitiesArray.fields.map((field, kIdx) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. Blood Donation Camps"
                {...register(`clubs.${clubIdx}.details.key_activities.${kIdx}`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteActivityIdx(kIdx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Recent Events</Label>
        <Input
          placeholder="'View Happenings' link"
          {...register(
            `clubs.${clubIdx}.details.recent_events.happenings_link`,
          )}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedEvents, "title")}
            onClick={() =>
              eventsArray.append({ id: "", title: "", image: "", link: "" })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Event
          </Button>
        </div>
        {eventsArray.fields.length === 0 ? (
          <ClubsEmptyState label="events" icon={CalendarDays} />
        ) : (
          eventsArray.fields.map((field, eIdx) => (
            <div key={field.id} className="space-y-1">
              <div className="grid grid-cols-[2fr_2fr_2fr_auto] gap-2 items-center">
                <Input
                  placeholder="Event Title"
                  {...register(
                    `clubs.${clubIdx}.details.recent_events.events.${eIdx}.title`,
                  )}
                />
                <ImageUpload
                  value={
                    watch(
                      `clubs.${clubIdx}.details.recent_events.events.${eIdx}.image`,
                    ) || ""
                  }
                  onChange={(url) =>
                    setValue(
                      `clubs.${clubIdx}.details.recent_events.events.${eIdx}.image`,
                      url,
                    )
                  }
                  context={`clubs-groups/event-image-${clubIdx}-${eIdx}`}
                />
                <Input
                  placeholder="Event link"
                  {...register(
                    `clubs.${clubIdx}.details.recent_events.events.${eIdx}.link`,
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteEventIdx(eIdx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {clubErrors?.details?.recent_events?.events?.[eIdx]?.title && (
                <p className="text-xs text-destructive">
                  {
                    clubErrors.details.recent_events.events[eIdx]?.title
                      ?.message
                  }
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteActivityIdx !== null}
        title="Remove Activity"
        description="Remove this key activity? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteActivityIdx(null)}
        onConfirm={() => {
          if (deleteActivityIdx === null) return;
          activitiesArray.remove(deleteActivityIdx);
          setDeleteActivityIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteEventIdx !== null}
        title="Remove Event"
        description="Remove this event? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteEventIdx(null)}
        onConfirm={() => {
          if (deleteEventIdx === null) return;
          eventsArray.remove(deleteEventIdx);
          setDeleteEventIdx(null);
        }}
      />
    </div>
  );
}

export function ClubsGroupsTab({
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
  const [deleteClubIdx, setDeleteClubIdx] = useState<number | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClubsGroupsTabData>({
    resolver: zodResolver(clubsGroupsTabSchema as any),
    values: payload,
  });

  const clubsArray = useFieldArray({
    control: control as any,
    name: "clubs",
  });

  const watchedClubs = watch("clubs") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="block font-bold">Clubs & Associations</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLastItemIncomplete(watchedClubs, "name")}
          onClick={() =>
            clubsArray.append({
              id: "",
              name: "",
              category: "",
              cover_image: "",
              logo: "",
              details: {
                about: "",
                mission: "",
                key_activities: [],
                recent_events: {
                  happenings_link: "",
                  events: [],
                },
              },
            })
          }
        >
          Add Club
        </Button>
      </div>

      {clubsArray.fields.length === 0 ? (
        <ClubsEmptyState label="clubs" icon={Users} />
      ) : (
        clubsArray.fields.map((field, idx) => (
          <ClubFields
            key={field.id}
            clubIdx={idx}
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            onRemoveClub={() => setDeleteClubIdx(idx)}
          />
        ))
      )}

      <ConfirmDialog
        open={deleteClubIdx !== null}
        title="Remove Club"
        description="Remove this club and all its activities and events? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteClubIdx(null)}
        onConfirm={() => {
          if (deleteClubIdx === null) return;
          clubsArray.remove(deleteClubIdx);
          setDeleteClubIdx(null);
        }}
      />
    </div>
  );
}
