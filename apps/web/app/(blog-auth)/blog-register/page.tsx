"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store";
import { getErrorMessage } from "@/lib/api";
import { registerBlogAuthor } from "@/lib/services/auth.service";

const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be under 100 characters")
      .refine(
        (v) => /^[a-zA-Z\s'-]+$/.test(v),
        "Name can only contain letters, spaces, hyphens, and apostrophes",
      ),
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
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirm_password: z.string(),
    bio: z
      .string()
      .trim()
      .max(1000, "Bio must be under 1000 characters")
      .optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterInput = z.infer<typeof registerSchema>;

export default function BlogRegisterPage(): React.JSX.Element {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const { mutate: register, isPending } = useMutation({
    mutationFn: registerBlogAuthor,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  function onSubmit(data: RegisterInput) {
    register(
      {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
        bio: data.bio || undefined,
      },
      {
        onSuccess: ({ user, token }) => {
          setAuth(user, token);
          toast.success("Account created! Welcome to BeaconU.");
          router.replace("/my/blogs");
        },
      },
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/40">
          <span className="text-xl font-black text-white">B</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          BeaconU
        </h1>
        <p className="mt-1 text-sm text-white/40">Blog Author Portal</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md shadow-2xl">
        <h2 className="mb-1 text-lg font-semibold text-white">
          Create an account
        </h2>
        <p className="mb-6 text-sm text-white/50">
          Start publishing on BeaconU
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="full_name"
              className="text-sm font-medium text-white/70"
            >
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
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
            <label
              htmlFor="email"
              className="text-sm font-medium text-white/70"
            >
              Email
            </label>
            <input
              id="email"
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

          {[
            {
              id: "password",
              label: "Password",
              show: showPassword,
              toggle: () => setShowConfirm((v) => !v),
            },
            {
              id: "confirm_password",
              label: "Confirm Password",
              show: showConfirm,
              toggle: () => setShowConfirm((v) => !v),
            },
          ].map(({ id, label, show, toggle }) => (
            <div key={id} className="space-y-1.5">
              <label htmlFor={id} className="text-sm font-medium text-white/70">
                {label}
              </label>
              <div className="relative">
                <input
                  id={id}
                  type={show ? "text" : "password"}
                  autoComplete={
                    id === "password" ? "new-password" : "new-password"
                  }
                  placeholder="••••••••"
                  className="flex h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 pr-10 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  {...form.register(id as "password" | "confirm_password")}
                />
                <button
                  type="button"
                  onClick={
                    id === "password"
                      ? () => setShowPassword((v) => !v)
                      : () => setShowConfirm((v) => !v)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {(id === "password" ? showPassword : showConfirm) ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors[id as "password" | "confirm_password"] && (
                <p className="text-xs text-destructive">
                  {
                    form.formState.errors[id as "password" | "confirm_password"]
                      ?.message
                  }
                </p>
              )}
            </div>
          ))}

          <div className="space-y-1.5">
            <label htmlFor="bio" className="text-sm font-medium text-white/70">
              Bio <span className="text-white/30 font-normal">(optional)</span>
            </label>
            <textarea
              id="bio"
              rows={3}
              placeholder="Tell readers about yourself…"
              className="flex w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
              {...form.register("bio")}
            />
            {form.formState.errors.bio && (
              <p className="text-xs text-destructive">
                {form.formState.errors.bio.message}
              </p>
            )}
          </div>

          <p className="text-[11px] text-white/30 leading-relaxed">
            Password must be 8+ chars with one uppercase letter and one number.
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? (
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
            href="/blog-login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-white/25">
        © {new Date().getFullYear()} BeaconU. All rights reserved.
      </p>
    </div>
  );
}
