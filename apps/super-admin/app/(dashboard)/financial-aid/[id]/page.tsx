"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useEducationLoan,
  useUpdateEducationLoan,
  useDeactivateEducationLoan,
  useActivateEducationLoan,
} from "@/hooks/use-financial-aid-loans";

const LOAN_TYPES = ["domestic", "abroad", "both"] as const;

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-gray-50 text-gray-500 border-gray-200",
};

const schema = z.object({
  bank_name: z.string().trim().min(1, "Bank name is required").max(255),
  bank_logo_url: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  product_name: z.string().trim().min(1, "Product name is required").max(255),
  tag: z.string().trim().max(50).optional().or(z.literal("")),
  interest_rate: z.string().trim().min(1, "Interest rate is required").max(100),
  interest_rate_min: z.coerce.number().positive().optional().or(z.literal("")),
  max_amount: z.string().trim().min(1, "Max amount is required").max(100),
  moratorium: z.string().trim().min(1, "Moratorium is required").max(100),
  processing_fee: z
    .string()
    .trim()
    .min(1, "Processing fee is required")
    .max(100),
  loan_type: z.enum(LOAN_TYPES),
  sort_order: z.coerce.number().int().min(0).default(0),
  processing_time: z.string().trim().max(100).optional().or(z.literal("")),
  margin: z.string().trim().max(100).optional().or(z.literal("")),
  collateral_amount: z.string().trim().max(100).optional().or(z.literal("")),
  non_collateral_amount: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal("")),
  repayment_tenure: z.string().trim().max(100).optional().or(z.literal("")),
  requires_cosigner: z.boolean().default(false),
  description: z.string().trim().optional().or(z.literal("")),
  expenses_covered_input: z.string().optional(),
  eligibility_input: z.string().optional(),
  eligible_courses: z.string().trim().optional().or(z.literal("")),
  documents_applicant_input: z.string().optional(),
  documents_co_applicant_input: z.string().optional(),
});

type FormInput = z.infer<typeof schema>;

function splitLines(val: string | undefined): string[] {
  if (!val) return [];
  return val
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinLines(arr: string[] | null | undefined): string {
  if (!arr || !arr.length) return "";
  return arr.join("\n");
}

export default function EducationLoanDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: loan, isLoading } = useEducationLoan(id);
  const { mutate: update, isPending: isSaving } = useUpdateEducationLoan();
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateEducationLoan();
  const { mutate: activate, isPending: isActivating } =
    useActivateEducationLoan();

  const isInactive = loan?.status === "inactive";

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      bank_name: "",
      bank_logo_url: "",
      product_name: "",
      tag: "",
      interest_rate: "",
      interest_rate_min: "",
      max_amount: "",
      moratorium: "",
      processing_fee: "",
      loan_type: "domestic",
      sort_order: 0,
      processing_time: "",
      margin: "",
      collateral_amount: "",
      non_collateral_amount: "",
      repayment_tenure: "",
      requires_cosigner: false,
      description: "",
      expenses_covered_input: "",
      eligibility_input: "",
      eligible_courses: "",
      documents_applicant_input: "",
      documents_co_applicant_input: "",
    },
  });

  useEffect(() => {
    if (!loan) return;
    form.reset({
      bank_name: loan.bankName,
      bank_logo_url: loan.bankLogoUrl ?? "",
      product_name: loan.productName,
      tag: loan.tag ?? "",
      interest_rate: loan.interestRate,
      interest_rate_min: loan.interestRateMin ?? "",
      max_amount: loan.maxAmount,
      moratorium: loan.moratorium,
      processing_fee: loan.processingFee,
      loan_type: loan.loanType,
      sort_order: loan.sortOrder,
      processing_time: loan.processingTime ?? "",
      margin: loan.margin ?? "",
      collateral_amount: loan.collateralAmount ?? "",
      non_collateral_amount: loan.nonCollateralAmount ?? "",
      repayment_tenure: loan.repaymentTenure ?? "",
      requires_cosigner: loan.requiresCosigner,
      description: loan.description ?? "",
      expenses_covered_input: joinLines(loan.expensesCovered),
      eligibility_input: joinLines(loan.eligibility),
      eligible_courses: loan.eligibleCourses ?? "",
      documents_applicant_input: joinLines(loan.documentsApplicant),
      documents_co_applicant_input: joinLines(loan.documentsCoApplicant),
    });
  }, [loan, form]);

  function onSubmit(data: FormInput) {
    update(
      {
        id,
        data: {
          bank_name: data.bank_name,
          bank_logo_url: data.bank_logo_url || undefined,
          product_name: data.product_name,
          tag: data.tag || undefined,
          interest_rate: data.interest_rate,
          interest_rate_min: data.interest_rate_min
            ? Number(data.interest_rate_min)
            : null,
          max_amount: data.max_amount,
          moratorium: data.moratorium,
          processing_fee: data.processing_fee,
          loan_type: data.loan_type,
          sort_order: data.sort_order,
          processing_time: data.processing_time || undefined,
          margin: data.margin || undefined,
          collateral_amount: data.collateral_amount || undefined,
          non_collateral_amount: data.non_collateral_amount || undefined,
          repayment_tenure: data.repayment_tenure || undefined,
          requires_cosigner: data.requires_cosigner,
          description: data.description || undefined,
          expenses_covered: splitLines(data.expenses_covered_input),
          eligibility: splitLines(data.eligibility_input),
          eligible_courses: data.eligible_courses || undefined,
          documents_applicant: splitLines(data.documents_applicant_input),
          documents_co_applicant: splitLines(data.documents_co_applicant_input),
        },
      },
      {
        onSuccess: () => toast.success("Loan updated"),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="border-b bg-background px-6 py-4">
          <Skeleton className="h-7 w-48 mb-1" />
        </div>
        <div className="flex-1 p-6 space-y-5 max-w-3xl">
          <Skeleton className="h-4 w-32" />
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!loan) return null;

  return (
    <div className="flex flex-col min-h-full">
      <Header title={`${loan.bankName} — ${loan.productName}`}>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
              STATUS_BADGE[loan.status],
            )}
          >
            {loan.status}
          </span>
          {isInactive ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={isActivating}
              onClick={() =>
                activate(id, {
                  onSuccess: () => toast.success("Loan activated"),
                })
              }
            >
              {isActivating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              Activate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-muted-foreground"
              disabled={isDeactivating}
              onClick={() =>
                deactivate(id, {
                  onSuccess: () => toast.success("Loan deactivated"),
                })
              }
            >
              {isDeactivating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              Deactivate
            </Button>
          )}
        </div>
      </Header>

      <div className="flex-1 p-6 space-y-5 max-w-3xl">
        <Link
          href="/financial-aid"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Financial Aid
        </Link>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Card Info */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Loan Card Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bank_name">
                    Bank Name <span className="text-destructive">*</span>
                  </Label>
                  <Input id="bank_name" {...form.register("bank_name")} />
                  {form.formState.errors.bank_name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.bank_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product_name">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input id="product_name" {...form.register("product_name")} />
                  {form.formState.errors.product_name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.product_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="loan_type">
                    Loan Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.watch("loan_type")}
                    onValueChange={(v) =>
                      form.setValue(
                        "loan_type",
                        v as (typeof LOAN_TYPES)[number],
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                  >
                    <SelectTrigger id="loan_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOAN_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tag">Badge Tag</Label>
                  <Input
                    id="tag"
                    placeholder="e.g. Low Interest, Fast Approval"
                    {...form.register("tag")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="interest_rate">
                    Interest Rate <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="interest_rate"
                    {...form.register("interest_rate")}
                  />
                  {form.formState.errors.interest_rate && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.interest_rate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="interest_rate_min">
                    Interest Rate Min{" "}
                    <span className="text-muted-foreground font-normal">
                      (for sorting)
                    </span>
                  </Label>
                  <Input
                    id="interest_rate_min"
                    type="number"
                    step="0.01"
                    {...form.register("interest_rate_min")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="max_amount">
                    Max Amount <span className="text-destructive">*</span>
                  </Label>
                  <Input id="max_amount" {...form.register("max_amount")} />
                  {form.formState.errors.max_amount && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.max_amount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="moratorium">
                    Moratorium <span className="text-destructive">*</span>
                  </Label>
                  <Input id="moratorium" {...form.register("moratorium")} />
                  {form.formState.errors.moratorium && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.moratorium.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="processing_fee">
                    Processing Fee <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="processing_fee"
                    {...form.register("processing_fee")}
                  />
                  {form.formState.errors.processing_fee && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.processing_fee.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    min="0"
                    {...form.register("sort_order")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bank_logo_url">Bank Logo URL</Label>
                <Input
                  id="bank_logo_url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  {...form.register("bank_logo_url")}
                />
                {form.formState.errors.bank_logo_url && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.bank_logo_url.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detail Info */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Detail Page Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="processing_time">Processing Time</Label>
                  <Input
                    id="processing_time"
                    placeholder="e.g. Upto 14 days"
                    {...form.register("processing_time")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="margin">Margin</Label>
                  <Input
                    id="margin"
                    placeholder="e.g. 15-20%"
                    {...form.register("margin")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="collateral_amount">Collateral Amount</Label>
                  <Input
                    id="collateral_amount"
                    placeholder="e.g. Upto ₹15 crore"
                    {...form.register("collateral_amount")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="non_collateral_amount">
                    Non-Collateral Amount
                  </Label>
                  <Input
                    id="non_collateral_amount"
                    placeholder="e.g. Upto ₹75 lakhs"
                    {...form.register("non_collateral_amount")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="repayment_tenure">Repayment Tenure</Label>
                  <Input
                    id="repayment_tenure"
                    placeholder="e.g. Upto 15 years"
                    {...form.register("repayment_tenure")}
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    id="requires_cosigner"
                    checked={form.watch("requires_cosigner")}
                    onCheckedChange={(v) =>
                      form.setValue("requires_cosigner", v)
                    }
                  />
                  <Label htmlFor="requires_cosigner" className="cursor-pointer">
                    Requires Co-signer
                  </Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description / Overview</Label>
                <Textarea
                  id="description"
                  rows={3}
                  className="resize-none"
                  {...form.register("description")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expenses_covered_input">
                  Expenses Covered{" "}
                  <span className="text-muted-foreground font-normal">
                    (one per line)
                  </span>
                </Label>
                <Textarea
                  id="expenses_covered_input"
                  rows={5}
                  className="resize-y"
                  {...form.register("expenses_covered_input")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eligibility_input">
                  Eligibility Criteria{" "}
                  <span className="text-muted-foreground font-normal">
                    (one per line)
                  </span>
                </Label>
                <Textarea
                  id="eligibility_input"
                  rows={5}
                  className="resize-y"
                  {...form.register("eligibility_input")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eligible_courses">Eligible Courses</Label>
                <Textarea
                  id="eligible_courses"
                  rows={3}
                  className="resize-none"
                  {...form.register("eligible_courses")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="documents_applicant_input">
                  Documents — Applicant{" "}
                  <span className="text-muted-foreground font-normal">
                    (one per line)
                  </span>
                </Label>
                <Textarea
                  id="documents_applicant_input"
                  rows={5}
                  className="resize-y"
                  {...form.register("documents_applicant_input")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="documents_co_applicant_input">
                  Documents — Co-Applicant{" "}
                  <span className="text-muted-foreground font-normal">
                    (one per line)
                  </span>
                </Label>
                <Textarea
                  id="documents_co_applicant_input"
                  rows={5}
                  className="resize-y"
                  {...form.register("documents_co_applicant_input")}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pb-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
