"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store";
import {
  useAmbassadors,
  useBookCampusVisit,
  useCampusVisitAvailability,
} from "@/hooks/use-campus-visits";
import {
  getBookableDates,
  formatBookableDateLabel,
} from "@/lib/campus-visit-availability";

const bookingSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  ambassador_id: z.string().optional(),
  proposed_date: z.string().min(1, "Please select an available date"),
  additional_visitors_count: z.coerce.number().int().min(0).default(0),
  guests: z
    .array(z.object({ name: z.string().min(1), relation: z.string().min(1) }))
    .optional(),
  reason_for_visit: z.string().min(1, "Reason for visit is required"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookCampusVisitPage() {
  const params = useParams<{ subdomain: string }>();
  const router = useRouter();
  const student = useAuthStore((s) => s.student);

  const { data: ambassadors = [] } = useAmbassadors(student?.collegeId ?? "");
  const { mutate: bookVisit, isPending } = useBookCampusVisit();

  const { data: availability = [], isLoading: isLoadingAvailability } =
    useCampusVisitAvailability(student?.collegeId ?? "");
  const availableDates = getBookableDates(availability);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      full_name: student?.fullName ?? "",
      email: student?.email ?? "",
      phone_number: student?.phone ?? "",
      additional_visitors_count: 0,
      guests: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "guests",
  });

  const additionalCount = form.watch("additional_visitors_count");

  function onSubmit(values: BookingFormValues) {
    if (!student?.collegeId) {
      toast.error("Unable to determine college. Please log in again.");
      return;
    }
    bookVisit(
      {
        ...values,
        college_id: student.collegeId,
        additional_visitors_count: values.additional_visitors_count ?? 0,
      },
      {
        onSuccess: () => {
          toast.success("Campus visit booked successfully!");
          router.push(`/college/${params.subdomain}/campus-visit/my-visits`);
        },
      },
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">
            Please log in to book a campus visit.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/college/${params.subdomain}/login`)}
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf7] [font-family:Poppins,ui-sans-serif,system-ui]">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A2B44]">
            Book a Campus Visit
          </h1>
          <p className="mt-2 text-slate-600">
            Schedule a visit and we&apos;ll have an ambassador ready to guide
            you.
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* Personal Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1A2B44]">
              Your Details
            </h2>

            <div className="space-y-1">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" {...form.register("full_name")} />
              {form.formState.errors.full_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.full_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input id="phone_number" {...form.register("phone_number")} />
                {form.formState.errors.phone_number && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.phone_number.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Visit Schedule */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1A2B44]">Schedule</h2>

            <div className="space-y-1">
              <Label htmlFor="proposed_date">Available Date</Label>
              <select
                id="proposed_date"
                defaultValue=""
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  form.setValue("proposed_date", e.target.value, {
                    shouldValidate: true,
                  })
                }
                disabled={isLoadingAvailability || availableDates.length === 0}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>
                  {isLoadingAvailability
                    ? "Loading available dates..."
                    : availableDates.length === 0
                      ? "No dates available right now"
                      : "Select a date"}
                </option>
                {availableDates.map((d) => (
                  <option key={d.date} value={d.date}>
                    {formatBookableDateLabel(d.date, d.time)}
                  </option>
                ))}
              </select>
              {form.formState.errors.proposed_date && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.proposed_date.message}
                </p>
              )}
            </div>

            {ambassadors.length > 0 && (
              <div className="space-y-1">
                <Label htmlFor="ambassador_id">
                  Campus Ambassador (Optional)
                </Label>
                <select
                  id="ambassador_id"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    form.setValue(
                      "ambassador_id",
                      e.target.value === "none" ? undefined : e.target.value,
                    )
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="none">No preference</option>
                  {ambassadors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName}
                      {a.campusCode ? ` (${a.campusCode})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Additional Visitors */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1A2B44]">
              Additional Visitors
            </h2>

            <div className="space-y-1">
              <Label htmlFor="additional_visitors_count">
                Number of Additional Visitors
              </Label>
              <Input
                id="additional_visitors_count"
                type="number"
                min={0}
                {...form.register("additional_visitors_count")}
              />
            </div>

            {Number(additionalCount) > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Guest details</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: "", relation: "" })}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Guest
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Guest name"
                        {...form.register(`guests.${index}.name`)}
                      />
                      {form.formState.errors.guests?.[index]?.name && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.guests[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Relation (e.g. Parent)"
                        {...form.register(`guests.${index}.relation`)}
                      />
                      {form.formState.errors.guests?.[index]?.relation && (
                        <p className="text-xs text-destructive">
                          {
                            form.formState.errors.guests[index]?.relation
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <Label htmlFor="reason_for_visit">Reason for Visit</Label>
            <textarea
              id="reason_for_visit"
              rows={3}
              placeholder="Briefly describe the purpose of your visit..."
              {...form.register("reason_for_visit")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {form.formState.errors.reason_for_visit && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reason_for_visit.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Booking..." : "Book Visit"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
