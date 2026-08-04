"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { useStudentAuthStore } from "@/store";
import { registerStudent } from "@/lib/services/student-auth.service";
import { AuthIllustration } from "../auth-illustration";

const registerSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(255),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: "Enter a valid email",
    })
    .optional(),
  agreed: z.literal(true, "You must agree to continue"),
});

type RegisterInput = z.infer<typeof registerSchema>;

function RegisterPageContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const code = searchParams.get("code") ?? "+91";
  const token = searchParams.get("token") ?? "";

  const setAuth = useStudentAuthStore((s) => s.setAuth);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", agreed: undefined },
  });

  async function onSubmit(data: RegisterInput) {
    setIsPending(true);
    try {
      const { user, accessToken } = await registerStudent({
        full_name: data.full_name,
        email: data.email || undefined,
        phone_number: phone,
        phone_country_code: code,
        registration_token: token,
      });
      setAuth(user, accessToken);
      toast.success("Account created!");
      router.replace("/account-picture");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsPending(false);
    }
  }

  const inputCls =
    "h-14 w-full bg-gray-100 rounded-2xl px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";

  return (
    <div className="flex flex-col">
      <p className="text-sm text-gray-500 font-medium">Complete Profile</p>
      <h1 className="text-3xl font-bold text-primary mt-0.5">Create Account</h1>

      <div className="my-4">
        <AuthIllustration />
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Full Name
          </label>
          <input
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            className={inputCls}
            {...form.register("full_name")}
          />
          {form.formState.errors.full_name && (
            <p className="text-xs text-red-500 px-1">
              {form.formState.errors.full_name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Email Address
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@gmail.com (optional)"
            className={inputCls}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-500 px-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Phone Number
          </label>
          <input
            type="tel"
            readOnly
            value={`${code}${phone}`}
            className={`${inputCls} text-gray-500 cursor-not-allowed`}
          />
        </div>

        {/* T&C */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 rounded accent-primary shrink-0"
            {...form.register("agreed")}
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            I agree to the{" "}
            <button
              type="button"
              className="text-primary font-medium hover:underline"
            >
              Terms &amp; Conditions
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="text-primary font-medium hover:underline"
            >
              Privacy Policy
            </button>
          </span>
        </label>
        {form.formState.errors.agreed && (
          <p className="text-xs text-red-500 -mt-2 px-1">
            {form.formState.errors.agreed.message}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="h-14 w-full rounded-full bg-primary text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:pointer-events-none mt-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Profile…
            </>
          ) : (
            "Create Profile"
          )}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage(): React.JSX.Element {
  return (
    <Suspense>
      <RegisterPageContent />
    </Suspense>
  );
}
