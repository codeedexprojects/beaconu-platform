"use client";

import { forwardRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const onboardingSchema = z.object({
  college_name: z
    .string()
    .trim()
    .min(2, "College name must be at least 2 characters"),
  university_name: z.string().trim().optional(),
  contact_person_name: z
    .string()
    .trim()
    .min(2, "Contact person name is required"),
  contact_email: z
    .string()
    .trim()
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: "Please enter a valid email address",
    }),
  contact_phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const BENEFITS = [
  "24/7 Priority Support",
  "Custom White-labeling",
  "Full rollout in under 3 weeks",
];

const inputClass =
  "w-full rounded-[10px] border border-white/15 bg-white/[0.04] px-4 py-3 text-[0.9rem] text-white outline-none transition-colors placeholder:text-white/35 focus:border-landing focus:bg-white/[0.06] focus:ring-2 focus:ring-landing/20";
const inputErrorClass = "border-destructive/70 bg-destructive/[0.08]";
const labelClass =
  "text-xs font-bold uppercase tracking-[0.06em] text-white/60";

export const OnboardingForm = forwardRef<HTMLDivElement>(
  function OnboardingForm(_props, ref) {
    const [status, setStatus] = useState<
      "idle" | "submitting" | "success" | "error"
    >("idle");
    const [universities, setUniversities] = useState<
      { id: string; name: string }[]
    >([]);

    useEffect(() => {
      fetch(`${API_BASE}/api/v1/public/universities`)
        .then((res) => res.json())
        .then((res) => {
          if (res.data) setUniversities(res.data);
        })
        .catch((err) => console.error("Failed to fetch universities", err));
    }, []);

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<OnboardingFormData>({
      resolver: zodResolver(onboardingSchema),
      defaultValues: {
        college_name: "",
        university_name: "",
        contact_person_name: "",
        contact_email: "",
        contact_phone: "",
        city: "",
        state: "",
        message: "",
      },
    });

    const onSubmit = async (data: OnboardingFormData) => {
      setStatus("submitting");
      try {
        const payload: Record<string, string> = {};
        (Object.keys(data) as (keyof OnboardingFormData)[]).forEach((k) => {
          const val = data[k];
          if (val && val.trim()) payload[k] = val.trim();
        });

        const res = await fetch(
          `${API_BASE}/api/v1/public/college-onboarding`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const errorMsg =
            (body as { message?: string }).message ?? "Submission failed";
          throw new Error(errorMsg);
        }

        setStatus("success");
        reset();
        toast.success(
          "Request submitted successfully! We'll be in touch within 24 hours.",
        );
      } catch (err) {
        setStatus("error");
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        toast.error(message);
      }
    };

    return (
      <section
        id="partner"
        className="scroll-mt-20 bg-cream px-6 py-24"
        ref={ref}
      >
        <div className="mx-auto max-w-[1100px] overflow-hidden rounded-[2rem] bg-navy-dark shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] md:grid md:grid-cols-2">
          {/* Left — pitch */}
          <div className="flex flex-col justify-center px-8 py-12 md:px-12 md:py-16">
            <h2 className="font-sans text-[2rem] font-black leading-[1.15] tracking-tight text-white sm:text-[2.25rem]">
              Ready to upgrade
              <br />
              your campus?
            </h2>
            <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-white/60">
              Join 500+ institutions already using BeaconU to define the next
              generation of higher education in India.
            </p>
            <ul className="mt-8 flex flex-col gap-4">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-landing/40 bg-landing/15 text-landing">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-white/80">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — form */}
          <div className="border-t border-white/10 px-8 py-12 md:border-l md:border-t-0 md:px-12 md:py-16">
            {status === "success" ? (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-success/30 bg-success/[0.15] text-3xl">
                  ✓
                </div>
                <div className="mb-3 text-2xl font-extrabold text-white">
                  Request Submitted!
                </div>
                <p className="text-[0.95rem] leading-relaxed text-white/60">
                  Thank you for your interest in partnering with BeaconU.
                  <br />
                  Our team will review your request and reach out within 24
                  hours.
                </p>
                <button
                  className="mt-6 rounded-xl bg-landing px-6 py-3 text-base font-bold text-white shadow-[0_4px_12px_rgba(244,106,18,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(244,106,18,0.35)]"
                  onClick={() => setStatus("idle")}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
                {status === "error" && (
                  <div className="mb-4 rounded-[10px] border border-destructive/30 bg-destructive/10 px-4 py-3.5 text-sm text-destructive-foreground">
                    ⚠ Please check the form and try again
                  </div>
                )}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass} htmlFor="college_name">
                      College Name <span className="text-landing">*</span>
                    </label>
                    <input
                      id="college_name"
                      {...register("college_name")}
                      className={cn(
                        inputClass,
                        errors.college_name && inputErrorClass,
                      )}
                      placeholder="e.g. St. Xavier's College"
                    />
                    {errors.college_name && (
                      <span className="text-xs font-medium text-destructive">
                        {errors.college_name.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass} htmlFor="university_name">
                      University / Affiliation
                    </label>
                    <select
                      id="university_name"
                      {...register("university_name")}
                      className={cn(
                        inputClass,
                        errors.university_name && inputErrorClass,
                      )}
                    >
                      <option value="" className="bg-navy-dark">
                        Select University
                      </option>
                      {universities.map((uni) => (
                        <option
                          key={uni.id}
                          value={uni.name}
                          className="bg-navy-dark"
                        >
                          {uni.name}
                        </option>
                      ))}
                    </select>
                    {errors.university_name && (
                      <span className="text-xs font-medium text-destructive">
                        {errors.university_name.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass} htmlFor="contact_person_name">
                      Contact Person <span className="text-landing">*</span>
                    </label>
                    <input
                      id="contact_person_name"
                      {...register("contact_person_name")}
                      className={cn(
                        inputClass,
                        errors.contact_person_name && inputErrorClass,
                      )}
                      placeholder="Your full name"
                    />
                    {errors.contact_person_name && (
                      <span className="text-xs font-medium text-destructive">
                        {errors.contact_person_name.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass} htmlFor="contact_email">
                      Official Email <span className="text-landing">*</span>
                    </label>
                    <input
                      id="contact_email"
                      type="email"
                      {...register("contact_email")}
                      className={cn(
                        inputClass,
                        errors.contact_email && inputErrorClass,
                      )}
                      placeholder="dean@college.edu.in"
                    />
                    {errors.contact_email && (
                      <span className="text-xs font-medium text-destructive">
                        {errors.contact_email.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass} htmlFor="contact_phone">
                      Phone Number
                    </label>
                    <input
                      id="contact_phone"
                      type="tel"
                      maxLength={10}
                      inputMode="numeric"
                      {...register("contact_phone")}
                      className={cn(
                        inputClass,
                        errors.contact_phone && inputErrorClass,
                      )}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(
                          /\D/g,
                          "",
                        );
                      }}
                    />
                    {errors.contact_phone && (
                      <span className="text-xs font-medium text-destructive">
                        {errors.contact_phone.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass} htmlFor="city">
                      City
                    </label>
                    <input
                      id="city"
                      {...register("city")}
                      className={cn(inputClass, errors.city && inputErrorClass)}
                      placeholder="e.g. Mumbai"
                    />
                    {errors.city && (
                      <span className="text-xs font-medium text-destructive">
                        {errors.city.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass} htmlFor="state">
                      State
                    </label>
                    <input
                      id="state"
                      {...register("state")}
                      className={cn(
                        inputClass,
                        errors.state && inputErrorClass,
                      )}
                      placeholder="e.g. Maharashtra"
                    />
                    {errors.state && (
                      <span className="text-xs font-medium text-destructive">
                        {errors.state.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label className={labelClass} htmlFor="message">
                      Message / Additional Info
                    </label>
                    <textarea
                      id="message"
                      {...register("message")}
                      className={cn(
                        inputClass,
                        "min-h-[100px] resize-y",
                        errors.message && inputErrorClass,
                      )}
                      placeholder="Tell us about your college, student strength, and what you're looking for..."
                    />
                    {errors.message && (
                      <span className="text-xs font-medium text-destructive">
                        {errors.message.message}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-landing py-4 text-base font-bold text-white transition-all enabled:hover:-translate-y-px enabled:hover:shadow-[0_8px_24px_rgba(244,106,18,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={status === "submitting"}
                >
                  {status === "submitting"
                    ? "Submitting..."
                    : "Submit Onboarding Request"}
                </button>
                <p className="mt-3.5 text-center text-xs text-white/40">
                  By submitting, you agree to our Terms of Service and Privacy
                  Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    );
  },
);
