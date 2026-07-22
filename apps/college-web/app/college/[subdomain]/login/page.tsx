"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { getErrorMessage } from "@/lib/api";
import { sendStudentOtp } from "@/lib/services/student-auth.service";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
];

const loginSchema = z.object({
  phone_country_code: z.string().default("+91"),
  phone_number: z.string().trim().min(10, "Enter a valid phone number").max(15),
});

type LoginInput = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const router = useRouter();
  const params = useParams<{ subdomain: string }>();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone_country_code: "+91", phone_number: "" },
  });

  async function onSubmit(data: LoginInput) {
    setIsPending(true);
    try {
      await sendStudentOtp(data.phone_number, data.phone_country_code);
      const query = new URLSearchParams({
        phone: data.phone_number,
        code: data.phone_country_code,
      });
      if (redirectTo) query.set("redirect", redirectTo);
      router.push(`/college/${params.subdomain}/otp?${query.toString()}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  const phoneError = form.formState.errors.phone_number;

  return (
    <AuthShell eyebrow="Welcome" title="Sign in to continue">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Phone Number</label>
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2.5">
            <select
              className="bg-transparent text-sm outline-none"
              {...form.register("phone_country_code")}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <div className="h-5 w-px bg-border/60" />
            <input
              type="tel"
              inputMode="numeric"
              placeholder="9876543210"
              autoComplete="tel"
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none"
              {...form.register("phone_number")}
            />
          </div>
          {phoneError ? (
            <p className="text-xs text-destructive">{phoneError.message}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={isPending} className="mt-2 h-11">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send OTP
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
