"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { CollegeLead } from "@/lib/services/college-leads.service";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  review_remarks: z.string().optional(),
  enableInstitutionGroup: z.boolean().optional(),
});

type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

interface CollegeLeadStatusModalProps {
  lead: CollegeLead | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateStatusFormData) => void;
  isPending: boolean;
}

export function CollegeLeadStatusModal({
  lead,
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: CollegeLeadStatusModalProps) {
  const form = useForm<UpdateStatusFormData>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: lead?.status || "pending",
      review_remarks: lead?.reviewRemarks || "",
      enableInstitutionGroup: false,
    },
  });

  if (!isOpen || !lead) return null;

  const handleSubmit = (data: UpdateStatusFormData) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Update Status</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Updating status for{" "}
                <span className="font-semibold text-foreground">
                  {lead.collegeName}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                {(["pending", "approved", "rejected"] as const).map(
                  (status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={
                        form.watch("status") === status ? "default" : "outline"
                      }
                      size="sm"
                      className="capitalize flex-1"
                      onClick={() => form.setValue("status", status)}
                    >
                      {status}
                    </Button>
                  ),
                )}
              </div>
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-remarks">Review Remarks</Label>
              <textarea
                id="review-remarks"
                {...form.register("review_remarks")}
                placeholder="Add internal notes or feedback..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {form.formState.errors.review_remarks && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.review_remarks.message}
                </p>
              )}
            </div>

            {form.watch("status") === "approved" && !lead.createdCollegeId && (
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="enable-institution-group"
                    className="text-sm font-semibold"
                  >
                    Enable Institution Group
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically create a group for this college and generate a
                    join code.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable-institution-group"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    {...form.register("enableInstitutionGroup")}
                  />
                </div>
              </div>
            )}
          </CardContent>

          <div className="flex justify-end gap-2 p-4 border-t bg-muted/20">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !form.watch("status")}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Status
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
