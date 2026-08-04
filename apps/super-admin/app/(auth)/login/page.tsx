"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import {
  platformAdminLoginSchema,
  type PlatformAdminLoginInput,
} from "@beaconu/validation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store";
import { loginAdmin } from "@/lib/services/auth.service";

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<PlatformAdminLoginInput>({
    resolver: zodResolver(platformAdminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: PlatformAdminLoginInput) {
    try {
      const { admin, token } = await loginAdmin(data);
      setAuth(admin, token);
      toast.success("Signed in successfully");
      router.replace("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070B14] flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/40">
            <span className="text-xl font-black text-white">B</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            BeaconU
          </h1>
          <p className="mt-1 text-sm text-white/40">Super Admin Panel</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md shadow-2xl">
          <h2 className="mb-1 text-lg font-semibold text-white">
            Welcome back
          </h2>
          <p className="mb-6 text-sm text-white/50">
            Sign in to your admin account
          </p>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/70">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@beaconu.com"
                aria-invalid={!!form.formState.errors.email}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/25 focus-visible:ring-primary aria-[invalid=true]:border-destructive/60"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/70">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!form.formState.errors.password}
                  className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/25 focus-visible:ring-primary aria-[invalid=true]:border-destructive/60"
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

            <Button
              type="submit"
              className="mt-2 w-full h-10 bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          © {new Date().getFullYear()} BeaconU. All rights reserved.
        </p>
      </div>
    </div>
  );
}
