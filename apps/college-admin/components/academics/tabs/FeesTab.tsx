"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
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
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";

export function FeesTab({
  payload,
  onChange,
  editingCourseId,
}: {
  payload: any;
  onChange: (updates: any) => void;
  editingCourseId: string | undefined;
}) {
  const [uploadingFeePdf, setUploadingFeePdf] = useState(false);

  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);

  const getFeeDetails = (): any[] => getActiveTabPayload().fee_details || [];

  const updateFeeDetails = (next: any[]) =>
    updateActiveTabPayload({ fee_details: next });

  const updateFeeDetail = (idx: number, patch: any) => {
    const next = [...getFeeDetails()];
    next[idx] = { ...next[idx], ...patch };
    updateFeeDetails(next);
  };

  const addFeeDetail = () => {
    updateFeeDetails([
      ...getFeeDetails(),
      {
        quota: "",
        gender: "",
        tuition_fees: [],
        additional_fees: [],
        one_time_payable_fees: [],
        deadlines_and_installments: [],
        fees_summary: { full_course_fee: "", booking_amount: "" },
      },
    ]);
  };

  const removeFeeDetail = (idx: number) => {
    updateFeeDetails(getFeeDetails().filter((_, i) => i !== idx));
  };

  const updateFeeDetailListItem = (
    detailIdx: number,
    field:
      | "tuition_fees"
      | "additional_fees"
      | "one_time_payable_fees"
      | "deadlines_and_installments",
    itemIdx: number,
    patch: any,
  ) => {
    const list = [...(getFeeDetails()[detailIdx]?.[field] || [])];
    list[itemIdx] = { ...list[itemIdx], ...patch };
    updateFeeDetail(detailIdx, { [field]: list });
  };

  const addFeeDetailListItem = (
    detailIdx: number,
    field:
      | "tuition_fees"
      | "additional_fees"
      | "one_time_payable_fees"
      | "deadlines_and_installments",
    emptyItem: any,
  ) => {
    const list = [...(getFeeDetails()[detailIdx]?.[field] || []), emptyItem];
    updateFeeDetail(detailIdx, { [field]: list });
  };

  const removeFeeDetailListItem = (
    detailIdx: number,
    field:
      | "tuition_fees"
      | "additional_fees"
      | "one_time_payable_fees"
      | "deadlines_and_installments",
    itemIdx: number,
  ) => {
    const list = (getFeeDetails()[detailIdx]?.[field] || []).filter(
      (_: any, i: number) => i !== itemIdx,
    );
    updateFeeDetail(detailIdx, { [field]: list });
  };

  const updateFeeStringList = (
    field: "whats_included" | "whats_excluded" | "refund_policy",
    next: string[],
  ) => updateActiveTabPayload({ [field]: next });

  const handleFeePdfUpload = async (file: File | null) => {
    if (!file) return;

    try {
      setUploadingFeePdf(true);
      const permanentUrl = await uploadCollegeAdminFile(
        file,
        `courses/${editingCourseId || "draft"}/fee-structure-pdf`,
      );
      updateActiveTabPayload({
        fee_structure_pdf: {
          ...(getActiveTabPayload().fee_structure_pdf || {}),
          url: permanentUrl,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        },
      });
      toast.success("Fee structure PDF uploaded successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadingFeePdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 border p-4 rounded-xl bg-muted/10">
        <h4 className="font-bold text-sm">Fee Structure PDF</h4>
        <div className="space-y-1">
          <Label className="text-xs">Upload PDF File</Label>
          <Input
            type="file"
            accept="application/pdf"
            disabled={uploadingFeePdf}
            onChange={(e) => handleFeePdfUpload(e.target.files?.[0] ?? null)}
          />
          {getActiveTabPayload().fee_structure_pdf?.url && (
            <p className="text-xs text-muted-foreground truncate">
              Current file: {getActiveTabPayload().fee_structure_pdf?.url}
            </p>
          )}
        </div>
      </div>

      {getFeeDetails().map((detail, dIdx) => (
        <div key={dIdx} className="space-y-4 rounded-md border p-4">
          <div className="flex items-center justify-between">
            <Label className="font-bold">Fee Detail #{dIdx + 1}</Label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeFeeDetail(dIdx)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Quota</Label>
              <Input
                placeholder="e.g. Merit Quota"
                value={detail.quota || ""}
                onChange={(e) =>
                  updateFeeDetail(dIdx, {
                    quota: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Gender</Label>
              <Select
                value={detail.gender || ""}
                onValueChange={(value) =>
                  updateFeeDetail(dIdx, {
                    gender: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Boys">Boys</SelectItem>
                  <SelectItem value="Girls">Girls</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 pt-2 border-t">
            <div className="space-y-1">
              <Label>Full Course Fee</Label>
              <Input
                placeholder="e.g. INR 1,48,750"
                value={detail.fees_summary?.full_course_fee || ""}
                onChange={(e) =>
                  updateFeeDetail(dIdx, {
                    fees_summary: {
                      ...(detail.fees_summary || {}),
                      full_course_fee: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Booking Amount</Label>
              <Input
                placeholder="e.g. INR 6,198"
                value={detail.fees_summary?.booking_amount || ""}
                onChange={(e) =>
                  updateFeeDetail(dIdx, {
                    fees_summary: {
                      ...(detail.fees_summary || {}),
                      booking_amount: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Tuition Fees (per year) */}
          <div className="space-y-2 pt-3 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-bold">Tuition Fees (Per Year)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  addFeeDetailListItem(dIdx, "tuition_fees", {
                    year: "",
                    amount: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Year
              </Button>
            </div>
            {(detail.tuition_fees || []).map((row: any, rIdx: number) => (
              <div key={rIdx} className="flex gap-2 items-center">
                <Input
                  placeholder="e.g. 1st Year"
                  value={row.year || ""}
                  onChange={(e) =>
                    updateFeeDetailListItem(dIdx, "tuition_fees", rIdx, {
                      year: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="e.g. Rs 1,25,276"
                  value={row.amount || ""}
                  onChange={(e) =>
                    updateFeeDetailListItem(dIdx, "tuition_fees", rIdx, {
                      amount: e.target.value,
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    removeFeeDetailListItem(dIdx, "tuition_fees", rIdx)
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* Additional Fees */}
          <div className="space-y-2 pt-3 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-bold">Additional Fees</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  addFeeDetailListItem(dIdx, "additional_fees", {
                    label: "",
                    amount: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Fee
              </Button>
            </div>
            {(detail.additional_fees || []).map((row: any, rIdx: number) => (
              <div key={rIdx} className="flex gap-2 items-center">
                <Input
                  placeholder="e.g. Examination Fees"
                  value={row.label || ""}
                  onChange={(e) =>
                    updateFeeDetailListItem(dIdx, "additional_fees", rIdx, {
                      label: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="e.g. Rs 3,500"
                  value={row.amount || ""}
                  onChange={(e) =>
                    updateFeeDetailListItem(dIdx, "additional_fees", rIdx, {
                      amount: e.target.value,
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    removeFeeDetailListItem(dIdx, "additional_fees", rIdx)
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* One-time Payable Fees */}
          <div className="space-y-2 pt-3 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-bold">One-Time Payable Fees</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  addFeeDetailListItem(dIdx, "one_time_payable_fees", {
                    label: "",
                    amount: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Fee
              </Button>
            </div>
            {(detail.one_time_payable_fees || []).map(
              (row: any, rIdx: number) => (
                <div key={rIdx} className="flex gap-2 items-center">
                  <Input
                    placeholder="e.g. Application Fees"
                    value={row.label || ""}
                    onChange={(e) =>
                      updateFeeDetailListItem(
                        dIdx,
                        "one_time_payable_fees",
                        rIdx,
                        { label: e.target.value },
                      )
                    }
                  />
                  <Input
                    placeholder="e.g. Rs 1,500"
                    value={row.amount || ""}
                    onChange={(e) =>
                      updateFeeDetailListItem(
                        dIdx,
                        "one_time_payable_fees",
                        rIdx,
                        { amount: e.target.value },
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      removeFeeDetailListItem(
                        dIdx,
                        "one_time_payable_fees",
                        rIdx,
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ),
            )}
          </div>

          {/* Deadlines & Installments */}
          <div className="space-y-2 pt-3 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-bold">Deadlines & Installments</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  addFeeDetailListItem(dIdx, "deadlines_and_installments", {
                    due: "",
                    label: "",
                    amount: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Installment
              </Button>
            </div>
            {(detail.deadlines_and_installments || []).map(
              (row: any, rIdx: number) => (
                <div key={rIdx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Due (e.g. Within 10 Days)"
                    value={row.due || ""}
                    onChange={(e) =>
                      updateFeeDetailListItem(
                        dIdx,
                        "deadlines_and_installments",
                        rIdx,
                        { due: e.target.value },
                      )
                    }
                  />
                  <Input
                    placeholder="Label (e.g. 1st Installment)"
                    value={row.label || ""}
                    onChange={(e) =>
                      updateFeeDetailListItem(
                        dIdx,
                        "deadlines_and_installments",
                        rIdx,
                        { label: e.target.value },
                      )
                    }
                  />
                  <Input
                    placeholder="e.g. Rs 25,000"
                    value={row.amount || ""}
                    onChange={(e) =>
                      updateFeeDetailListItem(
                        dIdx,
                        "deadlines_and_installments",
                        rIdx,
                        { amount: e.target.value },
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      removeFeeDetailListItem(
                        dIdx,
                        "deadlines_and_installments",
                        rIdx,
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ),
            )}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addFeeDetail}>
        <Plus className="h-4 w-4 mr-1" /> Add Fee Detail (Quota + Gender)
      </Button>

      {(
        [
          {
            field: "whats_included" as const,
            label: "What's Included",
            placeholder: "e.g. Tuition Fees",
          },
          {
            field: "whats_excluded" as const,
            label: "What's Excluded",
            placeholder: "e.g. Uniform Dress",
          },
          {
            field: "refund_policy" as const,
            label: "Refund Policy",
            placeholder: "e.g. Booking amount refundable within limited time",
          },
        ] as const
      ).map(({ field, label, placeholder }) => (
        <div key={field} className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label className="font-bold">{label}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateFeeStringList(field, [
                  ...(getActiveTabPayload()[field] || []),
                  "",
                ])
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          {(getActiveTabPayload()[field] || []).map(
            (item: string, idx: number) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  placeholder={placeholder}
                  value={item}
                  onChange={(e) => {
                    const next = [...(getActiveTabPayload()[field] || [])];
                    next[idx] = e.target.value;
                    updateFeeStringList(field, next);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const next = (getActiveTabPayload()[field] || []).filter(
                      (_: string, i: number) => i !== idx,
                    );
                    updateFeeStringList(field, next);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          )}
        </div>
      ))}
    </div>
  );
}
