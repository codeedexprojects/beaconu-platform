"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import { getErrorMessage } from "@/lib/api";
import {
  sendStudentOtp,
  verifyStudentOtp,
} from "@/lib/services/student-auth.service";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function OtpPageContent() {
  const router = useRouter();
  const params = useParams<{ subdomain: string }>();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const code = searchParams.get("code") ?? "+91";
  const redirectTo = searchParams.get("redirect") ?? "";

  const setAuth = useAuthStore((s) => s.setAuth);

  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otp = digits.join("");

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 3) focusInput(index + 1);
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        focusInput(index - 1);
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    const next = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    focusInput(Math.min(pasted.length, 3));
  }

  async function handleVerify() {
    if (otp.length < 4) {
      toast.error("Enter all 4 digits");
      return;
    }
    setIsPending(true);
    try {
      const result = await verifyStudentOtp(phone, code, otp);
      if (!result.isNewUser) {
        setAuth(result.user, result.accessToken);
        toast.success("Welcome back!");
        router.replace(redirectTo || `/college/${params.subdomain}`);
      } else {
        const query = new URLSearchParams({
          phone,
          code,
          token: result.registrationToken,
        });
        if (redirectTo) query.set("redirect", redirectTo);
        router.push(
          `/college/${params.subdomain}/register?${query.toString()}`,
        );
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDigits(["", "", "", ""]);
      focusInput(0);
    } finally {
      setIsPending(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    try {
      await sendStudentOtp(phone, code);
      setDigits(["", "", "", ""]);
      focusInput(0);
      toast.success("OTP resent");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell eyebrow="Verification" title="Enter OTP">
      <p className="text-sm text-muted-foreground">
        Enter the 4-digit code sent to{" "}
        <span className="font-semibold text-foreground">
          {code} {phone}
        </span>
      </p>

      <div className="mt-6 flex justify-center gap-3" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            className={cn(
              "h-14 w-12 rounded-xl border text-center text-lg font-semibold outline-none transition-colors",
              digit ? "border-foreground" : "border-border/60",
            )}
          />
        ))}
      </div>

      <Button
        onClick={handleVerify}
        disabled={isPending || otp.length < 4}
        className="mt-6 h-11 w-full"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Verify
      </Button>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="font-medium text-foreground hover:underline disabled:opacity-50"
        >
          {isResending ? "Resending…" : "Resend"}
        </button>
      </p>
    </AuthShell>
  );
}

export default function OtpPage() {
  return (
    <Suspense>
      <OtpPageContent />
    </Suspense>
  );
}
