"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdmissionCycles,
  useCreateAdmissionCycle,
  useUpdateAdmissionCycle,
  useDeleteAdmissionCycle,
} from "@/hooks/use-admission-cycles";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ManageCoursesDialog } from "@/components/application-forms/manage-courses-dialog";
import { ManageSeatPoolsDialog } from "@/components/application-forms/manage-seat-pools-dialog";
import type { AdmissionCycleItem } from "@beaconu/types";

const applicationFormSchema = z
  .object({
    application_type: z.string().trim().min(1, "Application type is required"),
    name: z.string().trim().min(1, "Application name is required"),
    admission_year: z.string().trim().min(1, "Admission year is required"),
    program_level: z.string().trim().min(1, "Program level is required"),
    starts_on: z.string().trim().min(1, "Start date is required"),
    ends_on: z.string().trim().optional(),
  })
  .refine((data) => !data.ends_on || data.ends_on >= data.starts_on, {
    message: "End date must be on or after the start date",
    path: ["ends_on"],
  });
type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

const EMPTY_VALUES: ApplicationFormValues = {
  application_type: "",
  name: "",
  admission_year: "",
  program_level: "",
  starts_on: "",
  ends_on: "",
};

const STATUS_VARIANT: Record<
  AdmissionCycleItem["status"],
  "default" | "outline" | "secondary"
> = {
  open: "default",
  closed: "secondary",
  archived: "outline",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ApplicationFormsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdmissionCycleItem | null>(null);
  const [deleting, setDeleting] = useState<AdmissionCycleItem | null>(null);
  const [managingCourses, setManagingCourses] =
    useState<AdmissionCycleItem | null>(null);
  const [managingSeatPools, setManagingSeatPools] =
    useState<AdmissionCycleItem | null>(null);

  const { data: forms, isLoading } = useAdmissionCycles();
  const { mutate: create, isPending: isCreating } = useCreateAdmissionCycle();
  const { mutate: update, isPending: isUpdating } = useUpdateAdmissionCycle();
  const { mutate: remove, isPending: isDeleting } = useDeleteAdmissionCycle();

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setOpen(true);
  }

  function openEdit(item: AdmissionCycleItem) {
    setEditing(item);
    form.reset({
      application_type: item.applicationType,
      name: item.name,
      admission_year: item.admissionYear,
      program_level: item.programLevel,
      starts_on: item.startsOn.slice(0, 10),
      ends_on: item.endsOn ? item.endsOn.slice(0, 10) : "",
    });
    setOpen(true);
  }

  function onSubmit(values: ApplicationFormValues) {
    const payload = {
      ...values,
      ends_on: values.ends_on || undefined,
    };
    if (editing) {
      update(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Application form updated");
            setOpen(false);
          },
        },
      );
    } else {
      create(payload, {
        onSuccess: () => {
          toast.success("Application form created");
          setOpen(false);
        },
      });
    }
  }

  function confirmDelete() {
    if (!deleting) return;
    remove(deleting.id, {
      onSuccess: () => {
        toast.success("Application form deleted");
        setDeleting(null);
      },
    });
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Application Forms
          </h1>
          <p className="text-sm text-muted-foreground">
            Define the admission intake windows students can apply against.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Application Form
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Application Form" : "Add Application Form"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="application_type">Application Type</Label>
                <Input
                  id="application_type"
                  placeholder="e.g. Regular"
                  {...form.register("application_type")}
                />
                {form.formState.errors.application_type && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.application_type.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Application Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. UG Admissions 2026"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="admission_year">Admission Year</Label>
                  <Input
                    id="admission_year"
                    placeholder="e.g. 2026"
                    {...form.register("admission_year")}
                  />
                  {form.formState.errors.admission_year && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.admission_year.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="program_level">Program Level</Label>
                  <Input
                    id="program_level"
                    placeholder="e.g. Undergraduate"
                    {...form.register("program_level")}
                  />
                  {form.formState.errors.program_level && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.program_level.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="starts_on">Starts On</Label>
                  <Input
                    id="starts_on"
                    type="date"
                    {...form.register("starts_on")}
                  />
                  {form.formState.errors.starts_on && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.starts_on.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ends_on">
                    Ends On{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="ends_on"
                    type="date"
                    {...form.register("ends_on")}
                  />
                  {form.formState.errors.ends_on && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.ends_on.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating
                    ? "Saving..."
                    : editing
                      ? "Save Changes"
                      : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Name
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Type
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Program Level
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Year
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Window
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="w-[140px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !forms || forms.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No application forms defined yet.
                  </TableCell>
                </TableRow>
              ) : (
                forms.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6 text-sm font-medium">
                      {item.name}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {item.applicationType}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {item.programLevel}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {item.admissionYear}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDate(item.startsOn)}
                      {item.endsOn ? ` – ${formatDate(item.endsOn)}` : ""}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={STATUS_VARIANT[item.status]}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => setManagingCourses(item)}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Courses
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => setManagingSeatPools(item)}
                        >
                          <Users className="h-3.5 w-3.5" />
                          Seat Pools
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                          onClick={() => setDeleting(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete application form?"
        description={
          deleting
            ? `"${deleting.name}" will no longer be available to students. This can't be undone from here.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        isPending={isDeleting}
      />

      <ManageCoursesDialog
        cycle={managingCourses}
        onClose={() => setManagingCourses(null)}
      />

      <ManageSeatPoolsDialog
        cycle={managingSeatPools}
        onClose={() => setManagingSeatPools(null)}
      />
    </div>
  );
}
