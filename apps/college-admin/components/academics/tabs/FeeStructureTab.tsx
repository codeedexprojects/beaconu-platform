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

const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{2}$/;

interface DraftInstalment {
  label: string;
  amount: string;
  dueDate: string;
}

export function FeeStructureTab({ courseId }: { courseId: string }) {
  const { data: rows, isLoading } = useFeeStructures(courseId);
  const { mutate: createRow, isPending: isCreating } =
    useCreateFeeStructure(courseId);
  const { mutate: deleteRow, isPending: isDeleting } =
    useDeleteFeeStructure(courseId);

  const [deleteTarget, setDeleteTarget] = useState<FeeStructureDto | null>(
    null,
  );
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [academicYear, setAcademicYear] = useState("");
  const [feeCategory, setFeeCategory] =
    useState<(typeof FEE_CATEGORIES)[number]>("tuition_fee");
  const [amount, setAmount] = useState("");
  const [yearOrSemester, setYearOrSemester] =
    useState<(typeof YEAR_OR_SEMESTER_OPTIONS)[number]>("One-time");
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("both");
  const [instalmentAllowed, setInstalmentAllowed] = useState(false);
  const [instalments, setInstalments] = useState<DraftInstalment[]>([]);
  const [feePdfUrl, setFeePdfUrl] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeRows = (rows ?? []).filter((r) => r.isActive);

  function resetForm() {
    setAcademicYear("");
    setFeeCategory("tuition_fee");
    setAmount("");
    setYearOrSemester("One-time");
    setGender("both");
    setInstalmentAllowed(false);
    setInstalments([]);
    setFeePdfUrl("");
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

  function handleCreate() {
    if (!academicYear.trim() || !feeCategory || !amount.trim()) {
      toast.error("Academic year, fee category, and amount are required");
      return;
    }
    if (!ACADEMIC_YEAR_REGEX.test(academicYear.trim())) {
      toast.error("Academic year must be in YYYY-YY format (e.g. 2026-27)");
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
      if (sum !== Number(amount)) {
        toast.error(
          `Installment amounts (${sum}) must sum to the fee amount (${amount})`,
        );
        return;
      }
      instalmentConfig = { instalments: parsedInstalments };
    }

    createRow(
      {
        academicYear: academicYear.trim(),
        feeCategory,
        amount: Number(amount),
        yearOrSemester,
        gender,
        instalmentAllowed,
        instalmentConfig,
        feePdfUrl: feePdfUrl || null,
      },
      {
        onSuccess: () => {
          toast.success("Fee structure row added");
          resetForm();
        },
      },
    );
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
            <Input
              placeholder="e.g. 2026-27"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">
              Format: YYYY-YY (must match the admission cycle&apos;s academic
              year, e.g. 2026-27)
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fee Category</Label>
            <Select
              value={feeCategory}
              onValueChange={(v) =>
                setFeeCategory(v as (typeof FEE_CATEGORIES)[number])
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
          <div className="space-y-1">
            <Label className="text-xs">Amount</Label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
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
          disabled={isCreating}
          size="sm"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-1" />
          )}
          Add Fee Row
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="font-bold text-sm text-foreground">
          Fee Structure Rows ({activeRows.length})
        </h4>
        {activeRows.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-muted/5 text-sm">
            No fee structure rows yet. Students won&apos;t see any fee breakdown
            for this course until you add rows here.
          </div>
        ) : (
          activeRows.map((row) => (
            <div
              key={row.id}
              className="border p-4 rounded-xl flex items-center justify-between bg-card"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {row.feeCategory}
                  </span>
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
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(row)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
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
