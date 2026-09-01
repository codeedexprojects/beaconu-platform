"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const studentReviewsTabSchema = z.object({
  overallRating: z.coerce
    .number()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5")
    .optional()
    .or(z.literal("")),
});

type StudentReviewsTabData = z.infer<typeof studentReviewsTabSchema>;

export function StudentReviewsTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<StudentReviewsTabData>({
    resolver: zodResolver(studentReviewsTabSchema as any),
    values: payload,
  });

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Overall Student Satisfaction Rating (1-5)</Label>
        <Input
          type="number"
          step="0.1"
          min={1}
          max={5}
          placeholder="e.g. 4.5"
          {...register("overallRating")}
        />
        {errors.overallRating && (
          <p className="text-xs text-destructive">
            {errors.overallRating.message}
          </p>
        )}
      </div>
    </div>
  );
}
