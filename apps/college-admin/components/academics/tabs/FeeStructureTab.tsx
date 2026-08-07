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
  const [feeCategory, setFeeCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [yearOrSemester, setYearOrSemester] = useState("");
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
    setFeeCategory("");
    setAmount("");
    setYearOrSemester("");
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
    if (!academicYear.trim() || !feeCategory.trim() || !amount.trim()) {
      toast.error("Academic year, fee category, and amount are required");
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
        feeCategory: feeCategory.trim(),
        amount: Number(amount),
        yearOrSemester: yearOrSemester.trim() || null,
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
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fee Category</Label>
            <Input
              placeholder="e.g. tuition_fee, library_fee"
              value={feeCategory}
              onChange={(e) => setFeeCategory(e.target.value)}
            />
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
            <Input
              placeholder="e.g. Year 1, Semester 1, One-time, Annual"
              value={yearOrSemester}
              onChange={(e) => setYearOrSemester(e.target.value)}
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
