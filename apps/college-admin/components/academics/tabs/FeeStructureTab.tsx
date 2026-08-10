"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";
import {
  useFeeStructures,
  useCreateFeeStructure,
  useDeleteFeeStructure,
} from "@/hooks/use-fee-structures";
import { useAdmissionCycles } from "@/hooks/use-admission-cycles";
import type {
  FeeStructureDto,
  FeeStructureInstalmentItem,
} from "@/lib/services/colleges.service";

const GENDERS = ["both", "male", "female"] as const;

const FEE_CATEGORIES = [
  "tuition_fee",
  "admission_fee",
  "application_fee",
  "registration_fee",
  "development_fee",
  "examination_fee",
  "library_fee",
  "laboratory_fee",
  "sports_fee",
  "clinical_fee",
  "hostel_fee",
  "caution_deposit",
  "other_fee",
] as const;

const FEE_CATEGORY_LABELS: Record<(typeof FEE_CATEGORIES)[number], string> = {
  tuition_fee: "Tuition Fee",
  admission_fee: "Admission Fee",
  application_fee: "Application Fee",
  registration_fee: "Registration Fee",
  development_fee: "Development Fee",
  examination_fee: "Examination Fee",
  library_fee: "Library Fee",
  laboratory_fee: "Laboratory Fee",
  sports_fee: "Sports Fee",
  clinical_fee: "Clinical Fee",
  hostel_fee: "Hostel Fee",
  caution_deposit: "Caution Deposit",
  other_fee: "Other Fee",
};

const YEAR_OR_SEMESTER_OPTIONS = [
  "One-time",
  "Annual",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
  "Semester 9",
  "Semester 10",
  "Semester 11",
  "Semester 12",
] as const;

interface DraftInstalment {
  label: string;
  amount: string;
  dueDate: string;
}

interface DraftFeeItem {
  feeCategory: (typeof FEE_CATEGORIES)[number];
  amount: string;
  description: string;
}

function newFeeItem(): DraftFeeItem {
  return { feeCategory: "tuition_fee", amount: "", description: "" };
}

// tuition_fee is excluded here — it always lands in the Semester/Year group
// regardless of yearOrSemester (see isSemesterRow below), so offering it in
// the Additional Fees form would silently misfile the row.
const ADDITIONAL_FEE_CATEGORIES = FEE_CATEGORIES.filter(
  (c) => c !== "tuition_fee",
);

function newAdditionalFeeItem(): DraftFeeItem {
  return { feeCategory: "library_fee", amount: "", description: "" };
}

// Mirrors CourseFeeSummaryQuery.isSemesterRow on the backend — keeps the
// admin's grouping in sync with how the student side buckets these rows.
function isSemesterRow(row: FeeStructureDto) {
  return (
    row.yearOrSemester !== "One-time" &&
    (row.feeCategory === "tuition_fee" ||
      row.yearOrSemester?.startsWith("Year") ||
      row.yearOrSemester?.startsWith("Semester"))
  );
}

export function FeeStructureTab({ courseId }: { courseId: string }) {
  const { data: rows, isLoading } = useFeeStructures(courseId);
  const { data: admissionCycles } = useAdmissionCycles();
  const { mutateAsync: createRow } = useCreateFeeStructure(courseId);
  const { mutate: deleteRow, isPending: isDeleting } =
    useDeleteFeeStructure(courseId);

  const academicYearOptions = Array.from(
    new Set((admissionCycles ?? []).map((c) => c.admissionYear)),
  ).sort();

  const [deleteTarget, setDeleteTarget] = useState<FeeStructureDto | null>(
    null,
  );
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  const [academicYear, setAcademicYear] = useState("");
  const [feeItems, setFeeItems] = useState<DraftFeeItem[]>([newFeeItem()]);
  const [yearOrSemester, setYearOrSemester] =
    useState<(typeof YEAR_OR_SEMESTER_OPTIONS)[number]>("One-time");
  const [dueDate, setDueDate] = useState("");
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("both");
  const [instalmentAllowed, setInstalmentAllowed] = useState(false);
  const [instalments, setInstalments] = useState<DraftInstalment[]>([]);
  const [feePdfUrl, setFeePdfUrl] = useState("");

  const [additionalAcademicYear, setAdditionalAcademicYear] = useState("");
  const [additionalFeeItems, setAdditionalFeeItems] = useState<DraftFeeItem[]>([
    newAdditionalFeeItem(),
  ]);
  const [additionalDueDate, setAdditionalDueDate] = useState("");
  const [isSubmittingAdditionalBatch, setIsSubmittingAdditionalBatch] =
    useState(false);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeRows = (rows ?? []).filter((r) => r.isActive);
  const oneTimeRows = activeRows.filter((r) => r.yearOrSemester === "One-time");
  const semesterRows = activeRows.filter(isSemesterRow);
  const additionalRows = activeRows.filter(
    (r) => r.yearOrSemester !== "One-time" && !isSemesterRow(r),
  );

  function resetForm() {
    setAcademicYear("");
    setFeeItems([newFeeItem()]);
    setYearOrSemester("One-time");
    setDueDate("");
    setGender("both");
    setInstalmentAllowed(false);
    setInstalments([]);
    setFeePdfUrl("");
  }

  function resetAdditionalForm() {
    setAdditionalAcademicYear("");
    setAdditionalFeeItems([newAdditionalFeeItem()]);
    setAdditionalDueDate("");
  }

  function handleAddAdditionalFeeItem() {
    setAdditionalFeeItems((prev) => [...prev, newAdditionalFeeItem()]);
  }

  function updateAdditionalFeeItem(idx: number, patch: Partial<DraftFeeItem>) {
    setAdditionalFeeItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    );
  }

  function removeAdditionalFeeItem(idx: number) {
    setAdditionalFeeItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleCreateAdditional() {
    if (!additionalAcademicYear.trim()) {
      toast.error("Academic year is required");
      return;
    }
    if (
      additionalFeeItems.length === 0 ||
      additionalFeeItems.some(
        (item) => !item.feeCategory || !item.amount.trim(),
      )
    ) {
      toast.error("Every fee line needs a category and an amount");
      return;
    }

    setIsSubmittingAdditionalBatch(true);
    try {
      for (const item of additionalFeeItems) {
        await createRow({
          academicYear: additionalAcademicYear.trim(),
          feeCategory: item.feeCategory,
          amount: Number(item.amount),
          yearOrSemester: "Annual",
          description: item.description.trim() || null,
          dueDate: additionalDueDate || null,
          gender: "both",
          instalmentAllowed: false,
          instalmentConfig: undefined,
          feePdfUrl: null,
        });
      }
      toast.success(
        additionalFeeItems.length > 1
          ? `${additionalFeeItems.length} additional fees added`
          : "Additional fee added",
      );
      resetAdditionalForm();
    } catch {
      // useCreateFeeStructure's onError already toasts the specific failure
    } finally {
      setIsSubmittingAdditionalBatch(false);
    }
  }

  function handleAddFeeItem() {
    setFeeItems((prev) => [...prev, newFeeItem()]);
  }

  function updateFeeItem(idx: number, patch: Partial<DraftFeeItem>) {
    setFeeItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    );
  }

  function removeFeeItem(idx: number) {
    setFeeItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handlePdfUpload(file: File | null) {
    if (!file) return;
    try {
      setUploadingPdf(true);
      const url = await uploadCollegeAdminFile(
        file,
        `courses/${courseId}/fee-structure-pdf`,
      );
      setFeePdfUrl(url);
      toast.success("Fee structure PDF uploaded successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadingPdf(false);
    }
  }

  function handleAddInstalment() {
    setInstalments((prev) => [...prev, { label: "", amount: "", dueDate: "" }]);
  }

  function updateInstalment(idx: number, patch: Partial<DraftInstalment>) {
    setInstalments((prev) =>
      prev.map((inst, i) => (i === idx ? { ...inst, ...patch } : inst)),
    );
  }

  function removeInstalment(idx: number) {
    setInstalments((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleCreate() {
    if (!academicYear.trim()) {
      toast.error("Academic year is required");
      return;
    }
    if (
      feeItems.length === 0 ||
      feeItems.some((item) => !item.feeCategory || !item.amount.trim())
    ) {
      toast.error("Every fee line needs a category and an amount");
      return;
    }

    let instalmentConfig:
      | { instalments: FeeStructureInstalmentItem[] }
      | undefined;
    if (instalmentAllowed) {
      if (instalments.length === 0) {
        toast.error("Add at least one installment or turn off installments");
        return;
      }
      const parsedInstalments: FeeStructureInstalmentItem[] = instalments.map(
        (inst) => ({
          label: inst.label,
          amount: Number(inst.amount) || 0,
          dueDate: inst.dueDate || undefined,
        }),
      );
      const sum = parsedInstalments.reduce((s, i) => s + i.amount, 0);
      const siblingTotal = activeRows
        .filter((r) => r.yearOrSemester === yearOrSemester)
        .reduce((s, r) => s + Number(r.amount), 0);
      const newItemsTotal = feeItems.reduce(
        (s, item) => s + (Number(item.amount) || 0),
        0,
      );
      const groupTotal = siblingTotal + newItemsTotal;
      if (Math.abs(sum - groupTotal) > 0.01) {
        toast.error(
          `Installment amounts (${sum}) must sum to the total of every fee row under "${yearOrSemester}" (${groupTotal}), not just the new lines`,
        );
        return;
      }
      instalmentConfig = { instalments: parsedInstalments };
    }

    setIsSubmittingBatch(true);
    try {
      for (let i = 0; i < feeItems.length; i++) {
        const item = feeItems[i];
        await createRow({
          academicYear: academicYear.trim(),
          feeCategory: item.feeCategory,
          amount: Number(item.amount),
          yearOrSemester,
          description: item.description.trim() || null,
          dueDate: dueDate || null,
          gender,
          // Only the first row in the batch carries the installment plan —
          // resolveGroup() picks one anchor row per semester group anyway.
          instalmentAllowed: i === 0 ? instalmentAllowed : false,
          instalmentConfig: i === 0 ? instalmentConfig : undefined,
          feePdfUrl: feePdfUrl || null,
        });
      }
      toast.success(
        feeItems.length > 1
          ? `${feeItems.length} fee rows added`
          : "Fee structure row added",
      );
      resetForm();
    } catch {
      // useCreateFeeStructure's onError already toasts the specific failure
    } finally {
      setIsSubmittingBatch(false);
    }
  }

  function handleDelete(row: FeeStructureDto) {
    setDeleteTarget(row);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteRow(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Fee structure row removed");
        setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <h4 className="font-bold text-sm text-foreground">
          Add a Fee Structure Row
        </h4>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">Academic Year</Label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYearOptions.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Pulled from this college&apos;s admission cycles — create an
              application form first if none show here.
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Year / Semester</Label>
            <Select
              value={yearOrSemester}
              onValueChange={(v) =>
                setYearOrSemester(
                  v as (typeof YEAR_OR_SEMESTER_OPTIONS)[number],
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OR_SEMESTER_OPTIONS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Due Date (optional)</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Gender</Label>
            <Select
              value={gender}
              onValueChange={(v) => setGender(v as (typeof GENDERS)[number])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fee Structure PDF</Label>
            <Input
              type="file"
              accept="application/pdf"
              disabled={uploadingPdf}
              onChange={(e) => handlePdfUpload(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold">
              Fee Lines (Category, Amount, Description)
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddFeeItem}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Another Fee
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Each line becomes its own fee row under the same Academic Year /
            Year-Semester above — e.g. add Library Fee, Clinical Fee, and Sports
            Fee together here instead of one at a time.
          </p>
          {feeItems.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <div className="flex-1">
                <Select
                  value={item.feeCategory}
                  onValueChange={(v) =>
                    updateFeeItem(idx, {
                      feeCategory: v as (typeof FEE_CATEGORIES)[number],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {FEE_CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min={0}
                placeholder="Amount"
                className="flex-1"
                value={item.amount}
                onChange={(e) => updateFeeItem(idx, { amount: e.target.value })}
              />
              <Input
                placeholder="Description / Subtitle (optional)"
                className="flex-1"
                value={item.description}
                onChange={(e) =>
                  updateFeeItem(idx, { description: e.target.value })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={feeItems.length === 1}
                onClick={() => removeFeeItem(idx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <input
            id="instalment-allowed"
            type="checkbox"
            className="h-4 w-4 rounded border-input"
            checked={instalmentAllowed}
            onChange={(e) => setInstalmentAllowed(e.target.checked)}
          />
          <Label htmlFor="instalment-allowed" className="text-xs">
            Allow payment in installments
          </Label>
        </div>

        {instalmentAllowed && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground">
              For Year/Semester fees, installment amounts must sum to the TOTAL
              of every fee row under the same Year/Semester (e.g. Tuition +
              Development + Laboratory combined), not just this row&apos;s own
              amount — since students pay the whole semester&apos;s fees
              together as one bundle.
            </p>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold">Installments</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddInstalment}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Installment
              </Button>
            </div>
            {instalments.map((inst, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  placeholder="Label (e.g. Installment 1)"
                  value={inst.label}
                  onChange={(e) =>
                    updateInstalment(idx, { label: e.target.value })
                  }
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Amount"
                  value={inst.amount}
                  onChange={(e) =>
                    updateInstalment(idx, { amount: e.target.value })
                  }
                />
                <Input
                  type="date"
                  value={inst.dueDate}
                  onChange={(e) =>
                    updateInstalment(idx, { dueDate: e.target.value })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInstalment(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          onClick={handleCreate}
          disabled={isSubmittingBatch}
          size="sm"
        >
          {isSubmittingBatch ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-1" />
          )}
          {feeItems.length > 1
            ? `Add ${feeItems.length} Fee Rows`
            : "Add Fee Row"}
        </Button>
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div>
          <h4 className="font-bold text-sm text-foreground">
            Add Additional Fees
          </h4>
          <p className="text-[10px] text-muted-foreground">
            Library, Clinical, Sports, and similar fees that show up as their
            own line items on the student side, separate from the bundled
            semester total. Tagged as &quot;Annual&quot; automatically so they
            never get pulled into a Semester group.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">Academic Year</Label>
            <Select
              value={additionalAcademicYear}
              onValueChange={setAdditionalAcademicYear}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYearOptions.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Due Date (optional)</Label>
            <Input
              type="date"
              value={additionalDueDate}
              onChange={(e) => setAdditionalDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold">
              Fee Lines (Category, Amount, Description)
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAdditionalFeeItem}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Another Fee
            </Button>
          </div>
          {additionalFeeItems.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <div className="flex-1">
                <Select
                  value={item.feeCategory}
                  onValueChange={(v) =>
                    updateAdditionalFeeItem(idx, {
                      feeCategory: v as (typeof FEE_CATEGORIES)[number],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADDITIONAL_FEE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {FEE_CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min={0}
                placeholder="Amount"
                className="flex-1"
                value={item.amount}
                onChange={(e) =>
                  updateAdditionalFeeItem(idx, { amount: e.target.value })
                }
              />
              <Input
                placeholder="Description / Subtitle (optional)"
                className="flex-1"
                value={item.description}
                onChange={(e) =>
                  updateAdditionalFeeItem(idx, {
                    description: e.target.value,
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={additionalFeeItems.length === 1}
                onClick={() => removeAdditionalFeeItem(idx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          onClick={handleCreateAdditional}
          disabled={isSubmittingAdditionalBatch}
          size="sm"
        >
          {isSubmittingAdditionalBatch ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-1" />
          )}
          {additionalFeeItems.length > 1
            ? `Add ${additionalFeeItems.length} Additional Fees`
            : "Add Additional Fee"}
        </Button>
      </div>

      <div className="space-y-6">
        <FeeRowGroup
          title="One-Time Fees"
          hint="Application/admission fees — paid once, shown separately on the student side."
          rows={oneTimeRows}
          onDelete={handleDelete}
        />
        <FeeRowGroup
          title="Semester / Year Fees"
          hint="Tuition and any Year-N / Semester-N rows — bundled into ONE payable total per Year/Semester on the student side (Pay Full or Pay in Installments together)."
          rows={semesterRows}
          onDelete={handleDelete}
        />
        <FeeRowGroup
          title="Additional Fees"
          hint="Everything else — e.g. Library, Clinical, Sports fees. Each shows as its own line item on the student side."
          rows={additionalRows}
          onDelete={handleDelete}
        />
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Fee Structure Row"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.feeCategory}" (${deleteTarget.yearOrSemester ?? deleteTarget.academicYear})? Students will no longer see this fee.`
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

function FeeRowGroup({
  title,
  hint,
  rows,
  onDelete,
}: {
  title: string;
  hint: string;
  rows: FeeStructureDto[];
  onDelete: (row: FeeStructureDto) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-bold text-sm text-foreground">
          {title} ({rows.length})
        </h4>
        <p className="text-[10px] text-muted-foreground">{hint}</p>
      </div>
      {rows.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground bg-muted/5 text-sm">
          No rows in this group yet.
        </div>
      ) : (
        rows.map((row) => (
          <div
            key={row.id}
            className="border p-4 rounded-xl flex items-center justify-between bg-card"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{row.feeCategory}</span>
                {row.yearOrSemester && (
                  <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {row.yearOrSemester}
                  </span>
                )}
                {row.instalmentAllowed && (
                  <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    Installments
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {row.academicYear} · ₹{row.amount} · {row.gender}
              </p>
              {row.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {row.description}
                </p>
              )}
              {row.dueDate && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Due by {row.dueDate}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(row)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
