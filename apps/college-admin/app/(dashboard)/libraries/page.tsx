"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import {
  Library as LibraryIcon,
  Plus,
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store";
import {
  useCollegeLibraries,
  useCreateCollegeLibrary,
  useUpdateCollegeLibrary,
  useDeleteCollegeLibrary,
  useCollegeDepartments,
} from "@/hooks/use-facilities";
import {
  uploadCollegeAdminFile,
  type LibraryDto,
} from "@/lib/services/colleges.service";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const commaNumberSchema = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (value) =>
        value === "" || Number.isFinite(Number(value.replace(/,/g, ""))),
      { message: `${label} must be a valid number` },
    );

const statFormSchema = z.object({
  value: commaNumberSchema("Value"),
  label: z.string().optional().default(""),
});

const resourceFormSchema = z.object({
  name: z.string().optional().default(""),
  count: commaNumberSchema("Count"),
});

const hoursDayFormSchema = z.object({
  day: z.string().optional().default(""),
  working_hours_start: z.string().optional().default(""),
  working_hours_end: z.string().optional().default(""),
  transaction_hours_start: z.string().optional().default(""),
  transaction_hours_end: z.string().optional().default(""),
});

const facilityFormSchema = z.object({
  name: z.string().optional().default(""),
  image: z.string().optional().default(""),
});

const libraryFormSchema = z
  .object({
    type: z.enum(["central", "department"]),
    departmentId: z.string().optional().default(""),
    name: z.string().trim().min(1, "Library name is required"),
    stats: z.array(statFormSchema),
    resources: z.array(resourceFormSchema),
    hours: z.array(hoursDayFormSchema),
    facilities: z.array(facilityFormSchema),
  })
  .refine((data) => data.type !== "department" || data.departmentId !== "", {
    message: "Select a department",
    path: ["departmentId"],
  });

type LibraryFormData = z.infer<typeof libraryFormSchema>;

const DEFAULT_VALUES: LibraryFormData = {
  type: "central",
  departmentId: "",
  name: "",
  stats: [],
  resources: [],
  hours: [],
  facilities: [],
};

function toFormData(library: LibraryDto): LibraryFormData {
  return {
    type: library.type,
    departmentId: library.departmentId || "",
    name: library.name,
    stats: (library.stats || []).map((s) => ({
      value: s.value || "",
      label: s.label || "",
    })),
    resources: (library.availableResources?.items || []).map((r) => ({
      name: r.name || "",
      count: r.count || "",
    })),
    hours: (library.libraryHours?.days || []).map((d) => ({
      day: d.day || "",
      working_hours_start: d.working_hours_start || "",
      working_hours_end: d.working_hours_end || "",
      transaction_hours_start: d.transaction_hours_start || "",
      transaction_hours_end: d.transaction_hours_end || "",
    })),
    facilities: (library.facilities?.items || []).map((f) => ({
      name: f.name || "",
      image: f.image || "",
    })),
  };
}

function toPayload(data: LibraryFormData) {
  return {
    type: data.type,
    departmentId: data.type === "department" ? data.departmentId : null,
    name: data.name,
    stats: data.stats,
    availableResources: { items: data.resources },
    libraryHours: { days: data.hours },
    facilities: { items: data.facilities },
  };
}

export default function LibrariesPage() {
  const user = useAuthStore((state) => state.user);
  const { data: libraries = [], isLoading: loadingLibraries } =
    useCollegeLibraries();
  const { data: departments = [] } = useCollegeDepartments();

  const { mutate: createLibrary, isPending: creating } =
    useCreateCollegeLibrary();
  const { mutate: updateLibrary, isPending: updating } =
    useUpdateCollegeLibrary();
  const { mutate: deleteLibrary, isPending: isDeleting } =
    useDeleteCollegeLibrary();

  const canManageLibraries =
    user?.roleSlug === "college_admin" ||
    (user?.permissions?.includes("library.manage") ?? false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LibraryFormData>({
    resolver: zodResolver(libraryFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const type = watch("type");

  const statsArray = useFieldArray({ control, name: "stats" });
  const resourcesArray = useFieldArray({ control, name: "resources" });
  const hoursArray = useFieldArray({ control, name: "hours" });
  const facilitiesArray = useFieldArray({ control, name: "facilities" });

  const handleOpenAdd = () => {
    if (!canManageLibraries) return;
    setEditingId(null);
    reset(DEFAULT_VALUES);
    setShowModal(true);
  };

  const handleOpenEdit = (library: LibraryDto) => {
    if (!canManageLibraries) return;
    setEditingId(library.id);
    reset(toFormData(library));
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleImageUpload = async (
    file: File | null,
    fieldPath: `facilities.${number}.image`,
    context: string,
  ) => {
    if (!file) return;

    try {
      setUploadingField(fieldPath);
      const permanentUrl = await uploadCollegeAdminFile(file, context);
      setValue(fieldPath, permanentUrl, { shouldDirty: true });
      toast.success("Image uploaded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!canManageLibraries) return;
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteLibrary(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`Library "${deleteTarget.name}" removed`);
        setDeleteTarget(null);
      },
    });
  };

  const onSubmit = (data: LibraryFormData) => {
    const payload = toPayload(data);
    if (editingId) {
      updateLibrary(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast.success("Library updated");
            handleClose();
          },
        },
      );
    } else {
      createLibrary(payload, {
        onSuccess: () => {
          toast.success("Library created");
          handleClose();
          reset(DEFAULT_VALUES);
        },
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-dark">Libraries</h1>
          <p className="text-sm text-muted-foreground">
            Manage the college&apos;s Central Library and department libraries.
            Link these to courses from the Academics tab.
          </p>
        </div>
        {canManageLibraries && (
          <Button onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-1" /> Add Library
          </Button>
        )}
      </div>

      {loadingLibraries ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : libraries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <LibraryIcon className="h-8 w-8 mx-auto mb-3 opacity-50" />
            No libraries added yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {libraries.map((library) => (
            <Card key={library.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-bold text-indigo-950">
                    {library.name}
                  </CardTitle>
                  <Badge
                    variant={
                      library.type === "central" ? "default" : "secondary"
                    }
                  >
                    {library.type === "central" ? "Central" : "Department"}
                  </Badge>
                </div>
                {library.department && (
                  <p className="text-xs text-muted-foreground">
                    {library.department.name}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {(library.stats || []).length} stats &middot;{" "}
                  {(library.availableResources?.items || []).length} resources
                  &middot; {(library.libraryHours?.days || []).length} hour
                  entries
                </p>
                {canManageLibraries && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(library)}
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(library.id, library.name)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="max-w-3xl max-h-[85vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Library" : "Add Library"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update this library's details."
                : "Add a Central Library or a Department Library."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Library Type</Label>
                <Select
                  value={type}
                  onValueChange={(value) => {
                    setValue("type", value as "central" | "department");
                    if (value === "central") setValue("departmentId", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central">Central Library</SelectItem>
                    <SelectItem value="department">
                      Department Library
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Library Name</Label>
                <Input
                  placeholder="e.g. Central Library"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {type === "department" && (
              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <Select
                  value={watch("departmentId")}
                  onValueChange={(value) => setValue("departmentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-xs text-destructive">
                    {errors.departmentId.message}
                  </p>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-sm">Stats</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => statsArray.append({ value: "", label: "" })}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Stat
                </Button>
              </div>
              {statsArray.fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Value (e.g. 21,786)"
                      {...register(`stats.${idx}.value`)}
                    />
                    {errors.stats?.[idx]?.value && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.stats[idx]?.value?.message}
                      </p>
                    )}
                  </div>
                  <Input
                    className="flex-1"
                    placeholder="Label (e.g. Sq Feet Area)"
                    {...register(`stats.${idx}.label`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => statsArray.remove(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Available Resources */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-sm">Available Resources</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => resourcesArray.append({ name: "", count: "" })}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Resource
                </Button>
              </div>
              {resourcesArray.fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <Input
                    className="flex-1"
                    placeholder="Resource name (e.g. E-Books)"
                    {...register(`resources.${idx}.name`)}
                  />
                  <div className="w-36">
                    <Input
                      placeholder="Count (e.g. 195,809)"
                      {...register(`resources.${idx}.count`)}
                    />
                    {errors.resources?.[idx]?.count && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.resources[idx]?.count?.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => resourcesArray.remove(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Library Hours */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-sm">Library Hours</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    hoursArray.append({
                      day: "",
                      working_hours_start: "",
                      working_hours_end: "",
                      transaction_hours_start: "",
                      transaction_hours_end: "",
                    })
                  }
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Day
                </Button>
              </div>
              {hoursArray.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-center flex-wrap"
                >
                  <Select
                    value={watch(`hours.${idx}.day`)}
                    onValueChange={(value) =>
                      setValue(`hours.${idx}.day`, value)
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs whitespace-nowrap">Working</Label>
                    <Input
                      type="time"
                      className="w-32"
                      {...register(`hours.${idx}.working_hours_start`)}
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="time"
                      className="w-32"
                      {...register(`hours.${idx}.working_hours_end`)}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs whitespace-nowrap">
                      Transaction
                    </Label>
                    <Input
                      type="time"
                      className="w-32"
                      {...register(`hours.${idx}.transaction_hours_start`)}
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="time"
                      className="w-32"
                      {...register(`hours.${idx}.transaction_hours_end`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => hoursArray.remove(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Facilities */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-sm">Facilities</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    facilitiesArray.append({ name: "", image: "" })
                  }
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Facility
                </Button>
              </div>
              {facilitiesArray.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-start"
                >
                  <Input
                    className="sm:flex-1"
                    placeholder="Facility name (e.g. Quiet Study Areas)"
                    {...register(`facilities.${idx}.name`)}
                  />
                  <div className="flex flex-col gap-2 sm:flex-1 sm:flex-row">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sm:w-40"
                      disabled={uploadingField === `facilities.${idx}.image`}
                      onChange={(e) =>
                        handleImageUpload(
                          e.target.files?.[0] ?? null,
                          `facilities.${idx}.image`,
                          `libraries/facilities-${idx}`,
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="self-end sm:self-start"
                    onClick={() => facilitiesArray.remove(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {(creating || updating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingId ? "Save Changes" : "Create Library"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Library"
        description={
          deleteTarget
            ? `Are you sure you want to remove library "${deleteTarget.name}"?`
            : ""
        }
        confirmLabel="Remove"
        variant="destructive"
        loading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
