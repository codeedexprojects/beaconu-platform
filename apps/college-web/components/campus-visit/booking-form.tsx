"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, User2 } from "lucide-react";
import { zodResolver } from "@/lib/zod-resolver";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AvailabilityStrip } from "@/components/campus-visit/availability-strip";
import {
  useBookCampusVisit,
  useCampusAmbassadors,
  useVisitAvailability,
} from "@/hooks/use-campus-visits";
import type { StudentUser } from "@/store";

const guestSchema = z.object({
  name: z.string().trim().min(1, "Guest name is required"),
  relation: z.string().trim().min(1, "Relation is required"),
});

const bookingSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone_number: z.string().trim().min(10, "Enter a valid phone number").max(15),
  ambassador_id: z.string().optional(),
  course_interest: z.string().trim().optional(),
  additional_visitors_count: z.coerce.number().int().min(0).max(10),
  guests: z.array(guestSchema).max(10),
  reason_for_visit: z
    .string()
    .trim()
    .min(10, "Please provide a more detailed reason (at least 10 characters)")
    .max(500),
  proposed_date: z.string().min(1, "Select a date"),
});

type BookingInput = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  collegeId: string;
  subdomain: string;
  student: StudentUser;
}

const inputCls =
  "h-11 w-full rounded-xl border border-border/60 bg-background px-3.5 text-sm outline-none focus:border-foreground/30";

export function BookingForm({
  collegeId,
  subdomain,
  student,
}: BookingFormProps) {
  const router = useRouter();
  const { data: ambassadors } = useCampusAmbassadors(collegeId, true);
  const { data: availability } = useVisitAvailability(collegeId, true);
  const { mutate: book, isPending } = useBookCampusVisit(collegeId);
  const [showGuests, setShowGuests] = useState(false);

  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      full_name: student.fullName,
      email: student.email ?? "",
      phone_number: "",
      ambassador_id: "",
      course_interest: "",
      additional_visitors_count: 0,
      guests: [],
      reason_for_visit: "",
      proposed_date: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "guests",
  });

  const additionalVisitorsCount = useWatch({
    control: form.control,
    name: "additional_visitors_count",
  });

  const today = new Date().toISOString().split("T")[0];

  function onSubmit(data: BookingInput) {
    book(
      {
        college_id: collegeId,
        ambassador_id: data.ambassador_id || undefined,
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        course_interest: data.course_interest || undefined,
        additional_visitors_count: data.additional_visitors_count,
        guests: data.guests.length > 0 ? data.guests : undefined,
        reason_for_visit: data.reason_for_visit,
        proposed_date: data.proposed_date,
      },
      {
        onSuccess: () => {
          toast.success("Campus visit requested");
          router.push(`/college/${subdomain}/campus-visit/my-visits`);
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      {availability ? <AvailabilityStrip availability={availability} /> : null}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-4 rounded-2xl border border-border/60 p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Full Name</label>
            <input className={inputCls} {...form.register("full_name")} />
            {form.formState.errors.full_name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.full_name.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className={inputCls}
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              placeholder="9876543210"
              className={inputCls}
              {...form.register("phone_number")}
            />
            {form.formState.errors.phone_number ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.phone_number.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Proposed Date</label>
            <input
              type="date"
              min={today}
              className={inputCls}
              {...form.register("proposed_date")}
            />
            {form.formState.errors.proposed_date ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.proposed_date.message}
              </p>
            ) : null}
          </div>
        </div>

        {(ambassadors?.length ?? 0) > 0 ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              Preferred Ambassador (optional)
            </label>
            <select className={inputCls} {...form.register("ambassador_id")}>
              <option value="">No preference</option>
              {ambassadors?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">
            Course Interest (optional)
          </label>
          <input
            className={inputCls}
            placeholder="e.g. BCA, MBA"
            {...form.register("course_interest")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Reason for Visit</label>
          <textarea
            rows={3}
            className={cn(inputCls, "h-auto py-2.5")}
            placeholder="What would you like to explore during your visit?"
            {...form.register("reason_for_visit")}
          />
          {form.formState.errors.reason_for_visit ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.reason_for_visit.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">
            Additional Visitors ({additionalVisitorsCount})
          </label>
          <input
            type="number"
            min={0}
            max={10}
            className={inputCls}
            {...form.register("additional_visitors_count")}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowGuests((v) => !v)}
            className="text-sm font-medium text-foreground hover:underline"
          >
            {showGuests ? "Hide guest details" : "Add guest details (optional)"}
          </button>

          {showGuests ? (
            <div className="mt-3 space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-xs text-muted-foreground">
                      Name
                    </label>
                    <input
                      className={inputCls}
                      {...form.register(`guests.${index}.name`)}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-xs text-muted-foreground">
                      Relation
                    </label>
                    <input
                      className={inputCls}
                      placeholder="e.g. Parent"
                      {...form.register(`guests.${index}.relation`)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {fields.length < 10 ? (
                <button
                  type="button"
                  onClick={() => append({ name: "", relation: "" })}
                  className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add guest
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <Button type="submit" disabled={isPending} className="h-11 w-full">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          <User2 className="mr-1.5 h-4 w-4" />
          Request Campus Visit
        </Button>
      </form>
    </div>
  );
}
