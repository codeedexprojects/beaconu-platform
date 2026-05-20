"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store";
import { registerBlogAuthor } from "@/lib/services/auth.service";

const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be under 100 characters")
      .refine((v) => /^[a-zA-Z\s'-]+$/.test(v), {
        message:
          "Full name can only contain letters, spaces, hyphens, and apostrophes",
      }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
        message: "Enter a valid email address",
      }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long")
      .refine((v) => /[A-Z]/.test(v), {
        message: "Must contain at least one uppercase letter",
      })
      .refine((v) => /[0-9]/.test(v), {
        message: "Must contain at least one number",
      }),
    confirm_password: z.string().min(1, "Please confirm your password"),
    bio: z
      .string()
      .trim()
      .max(1000, "Bio must be under 1000 characters")
      .optional(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage(): React.JSX.Element {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      bio: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: RegisterInput) {
    try {
      const { user, token } = await registerBlogAuthor({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
        bio: data.bio || undefined,
      });
      setAuth(user, token);
      toast.success("Account created! Welcome to BeaconU.");
      router.replace("/home");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className="relative w-full max-w-sm animate-fade-in">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/40">
          <span className="text-xl font-black text-white">B</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          BeaconU
        </h1>
        <p className="mt-1 text-sm text-white/40">Create your author account</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md shadow-2xl">
        <h2 className="mb-1 text-lg font-semibold text-white">Get started</h2>
        <p className="mb-6 text-sm text-white/50">
          Share your college experiences with the world
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">
              Full Name
            </label>
            <input
              type="text"
              autoComplete="name"
              placeholder="Riya Sharma"
              className="flex h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              {...form.register("full_name")}
            />
            {form.formState.errors.full_name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="flex h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="flex h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 pr-10 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">
              Confirm Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              className="flex h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              {...form.register("confirm_password")}
            />
            {form.formState.errors.confirm_password && (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirm_password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">
              Bio <span className="text-white/30">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Tell readers a little about yourself…"
              className="flex w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
              {...form.register("bio")}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-white/40">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
