"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { Loader2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUniversities } from "@/hooks/use-universities";
import type {
  CollegeLead,
  CollegeLeadUpsertInput,
} from "@/lib/services/college-leads.service";

const leadFormSchema = z.object({
  collegeName: z.string().trim().min(2, "College name is required"),
  universityName: z.string().trim().optional(),
  contactPersonName: z
    .string()
    .trim()
    .min(2, "Contact person name is required"),
  contactEmail: z.string().trim().email("Enter a valid email"),
  contactPhone: z.string().trim().max(20).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  groupCode: z.string().trim().max(20).optional(),
  message: z.string().trim().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface CollegeLeadFormModalProps {
  lead: CollegeLead | null;
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: CollegeLeadUpsertInput) => void;
}

export function CollegeLeadFormModal({
  lead,
  isOpen,
  isPending,
  onClose,
  onSubmit,
}: CollegeLeadFormModalProps) {
  const { data: universitiesData, isLoading: isUniversitiesLoading } =
    useUniversities();
  const universities = universitiesData ?? [];

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      collegeName: "",
      universityName: "",
      contactPersonName: "",
      contactEmail: "",
      contactPhone: "",
      city: "",
      state: "",
      groupCode: "",
      message: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    form.reset({
      collegeName: lead?.collegeName ?? "",
      universityName: lead?.universityName ?? "",
      contactPersonName: lead?.contactPersonName ?? "",
      contactEmail: lead?.contactEmail ?? "",
      contactPhone: lead?.contactPhone ?? "",
      city: lead?.city ?? "",
      state: lead?.state ?? "",
      groupCode: lead?.groupCode ?? "",
      message: lead?.message ?? "",
    });
  }, [form, isOpen, lead]);

  if (!isOpen) return null;

  const handleFormSubmit = (data: LeadFormData) => {
    onSubmit({
      collegeName: data.collegeName,
      universityName: data.universityName || undefined,
      contactPersonName: data.contactPersonName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      groupCode: data.groupCode || undefined,
      message: data.message || undefined,
    });
  };

  const selectedUniversityName = form.watch("universityName") || "";
  const hasSelectedUniversityInList = universities.some(
    (university) => university.name === selectedUniversityName,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">
            {lead ? "Edit College Lead" : "Create College Lead"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="collegeName">College Name</Label>
                <Input id="collegeName" {...form.register("collegeName")} />
                {form.formState.errors.collegeName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.collegeName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>University Name</Label>
                <Select
                  value={selectedUniversityName || undefined}
                  onValueChange={(value) =>
                    form.setValue(
                      "universityName",
                      value === "__none__" ? "" : value,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isUniversitiesLoading
                          ? "Loading universities..."
                          : "Select a university"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {selectedUniversityName && !hasSelectedUniversityInList && (
                      <SelectItem value={selectedUniversityName}>
                        {selectedUniversityName}
                      </SelectItem>
                    )}
                    {universities.map((university) => (
                      <SelectItem key={university.id} value={university.name}>
                        {university.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPersonName">Contact Person</Label>
                <Input
                  id="contactPersonName"
                  {...form.register("contactPersonName")}
                />
                {form.formState.errors.contactPersonName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.contactPersonName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...form.register("contactEmail")}
                />
                {form.formState.errors.contactEmail && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.contactEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input id="contactPhone" {...form.register("contactPhone")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupCode">Institution Group Code</Label>
                <Input id="groupCode" {...form.register("groupCode")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...form.register("city")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...form.register("state")} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  rows={4}
                  {...form.register("message")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Add any context or notes..."
                />
              </div>
            </div>
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {lead ? "Save Changes" : "Create Lead"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
