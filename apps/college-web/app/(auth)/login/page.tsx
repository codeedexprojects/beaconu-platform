"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store";

type Step = "email" | "otp";

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/college/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Failed to send OTP. Please try again.");
        return;
      }

      setStep("otp");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/college/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Invalid OTP. Please try again.");
        return;
      }

      setAuth(data.data.student, data.data.token);
      router.replace("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setStep("email");
    setOtp("");
    setError("");
  }

  function handleDevBypass() {
    setAuth(
      {
        id: "dev-student-001",
        fullName: "Test Student",
        email: "student@beaconu.com",
        collegeId: "dev-college-001",
      },
      "dev-token",
    );
    router.replace("/");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070B14] flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/40">
            <span className="text-xl font-black text-white">B</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            BeaconU
          </h1>
          <p className="mt-1 text-sm text-white/40">College Student Portal</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md shadow-2xl">
          {step === "email" ? (
            <>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white leading-tight">
                    Sign in
                  </h2>
                  <p className="text-xs text-white/40">
                    We&apos;ll send a one-time code to your email
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-white/70">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/25 focus-visible:ring-primary"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="mt-2 w-full h-10 bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white leading-tight">
                    Enter OTP
                  </h2>
                  <p className="text-xs text-white/40">
                    Sent to{" "}
                    <span className="text-white/60 font-medium">{email}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-white/70">
                    One-time code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="••••••"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/25 focus-visible:ring-primary tracking-[0.4em] text-center text-lg font-mono"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="mt-2 w-full h-10 bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
                  disabled={loading || otp.length !== 6}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Sign In
                </Button>
              </form>

              <button
                type="button"
                onClick={handleBack}
                className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to email
              </button>
            </>
          )}
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-center text-xs font-medium text-white/40 uppercase tracking-widest">
              Dev bypass
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full h-9 border-white/15 bg-transparent text-white/60 hover:bg-white/5 hover:text-white text-sm"
              onClick={handleDevBypass}
            >
              Enter as Test Student
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-white/25">
          © {new Date().getFullYear()} BeaconU. All rights reserved.
        </p>
      </div>
    </div>
  );
}
