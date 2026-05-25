"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateEducationLoan } from "@/hooks/use-financial-aid-loans";

const LOAN_TYPES = ["domestic", "abroad", "both"] as const;

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
  loan_type: z.enum(LOAN_TYPES, { error: "Loan type is required" }),
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

export default function NewEducationLoanPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateEducationLoan();

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
      loan_type: undefined,
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

  function onSubmit(data: FormInput) {
    create(
      {
        bank_name: data.bank_name,
        bank_logo_url: data.bank_logo_url || undefined,
        product_name: data.product_name,
        tag: data.tag || undefined,
        interest_rate: data.interest_rate,
        interest_rate_min: data.interest_rate_min
          ? Number(data.interest_rate_min)
          : undefined,
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
      {
        onSuccess: () => {
          toast.success("Education loan created");
          router.push("/financial-aid");
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="New Education Loan" />

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
                  <Input
                    id="bank_name"
                    placeholder="e.g. State Bank of India"
                    {...form.register("bank_name")}
                  />
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
                  <Input
                    id="product_name"
                    placeholder="e.g. Student Scholar Loan"
                    {...form.register("product_name")}
                  />
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
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOAN_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.loan_type && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.loan_type.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tag">
                    Badge Tag{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
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
                    placeholder="e.g. 8.15% p.a."
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
                    Interest Rate Min (numeric){" "}
                    <span className="text-muted-foreground font-normal">
                      (for sorting)
                    </span>
                  </Label>
                  <Input
                    id="interest_rate_min"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 8.15"
                    {...form.register("interest_rate_min")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="max_amount">
                    Max Amount <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="max_amount"
                    placeholder="e.g. ₹ 40 Lakhs"
                    {...form.register("max_amount")}
                  />
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
                  <Input
                    id="moratorium"
                    placeholder="e.g. Course + 1 Year"
                    {...form.register("moratorium")}
                  />
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
                    placeholder="e.g. Nil, Up to 1.5%"
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
                    placeholder="0"
                    {...form.register("sort_order")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bank_logo_url">
                  Bank Logo URL{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
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
                  <Label htmlFor="processing_time">
                    Processing Time{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="processing_time"
                    placeholder="e.g. Upto 14 days"
                    {...form.register("processing_time")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="margin">
                    Margin{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="margin"
                    placeholder="e.g. 15-20%"
                    {...form.register("margin")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="collateral_amount">
                    Collateral Amount{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="collateral_amount"
                    placeholder="e.g. Upto ₹15 crore"
                    {...form.register("collateral_amount")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="non_collateral_amount">
                    Non-Collateral Amount{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
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
                  <Label htmlFor="repayment_tenure">
                    Repayment Tenure{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
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
                <Label htmlFor="description">
                  Description / Overview{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  className="resize-none"
                  placeholder="Introductory paragraph about this loan product…"
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
                  placeholder={
                    "Tuition fees\nHostel and mess fees\nExamination, library, and laboratory fees"
                  }
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
                  placeholder={
                    "Applicant should be an Indian Citizen\nSecured admission to a higher education institution abroad"
                  }
                  {...form.register("eligibility_input")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eligible_courses">
                  Eligible Courses{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="eligible_courses"
                  rows={3}
                  className="resize-none"
                  placeholder="Describe which courses are eligible…"
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
                  placeholder={
                    "Identity proof (PAN Card or Employee Identity Card)\nProof of address (Electricity bill, Telephone bill, or Ration card)"
                  }
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
                  placeholder={
                    "Identity proof (PAN Card or Employee Identity Card)\nProof of address (Electricity bill, Telephone bill, or Ration card)"
                  }
                  {...form.register("documents_co_applicant_input")}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/financial-aid")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Creating…" : "Create Loan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
