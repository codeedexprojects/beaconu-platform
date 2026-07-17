"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { useAuthStore } from "@/store";
import { getErrorMessage } from "@/lib/api";
import { registerStudent } from "@/lib/services/student-auth.service";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

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
});

type RegisterInput = z.infer<typeof registerSchema>;

function RegisterPageContent() {
  const router = useRouter();
  const params = useParams<{ subdomain: string }>();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const code = searchParams.get("code") ?? "+91";
  const token = searchParams.get("token") ?? "";
  const redirectTo = searchParams.get("redirect") ?? "";

  const setAuth = useAuthStore((s) => s.setAuth);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "" },
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
      router.replace(redirectTo || `/college/${params.subdomain}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  const inputCls =
    "h-11 w-full rounded-xl border border-border/60 bg-background px-3.5 text-sm outline-none focus:border-foreground/30";

  return (
    <AuthShell eyebrow="Almost there" title="Create your profile">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Full Name</label>
          <input
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            autoFocus
            className={inputCls}
            {...form.register("full_name")}
          />
          {form.formState.errors.full_name ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.full_name.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Email (optional)</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
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
            readOnly
            value={`${code} ${phone}`}
            className={`${inputCls} cursor-not-allowed text-muted-foreground`}
          />
        </div>

        <Button type="submit" disabled={isPending} className="mt-2 h-11">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Profile
        </Button>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageContent />
    </Suspense>
  );
}
