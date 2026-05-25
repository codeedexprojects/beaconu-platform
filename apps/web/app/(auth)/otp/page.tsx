"use client";

import { useRef, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStudentAuthStore } from "@/store";
import {
  verifyStudentOtp,
  sendStudentOtp,
} from "@/lib/services/student-auth.service";
import { AuthIllustration } from "../auth-illustration";

function OtpPageContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const code = searchParams.get("code") ?? "+91";

  const setAuth = useStudentAuthStore((s) => s.setAuth);

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
        router.replace("/home");
      } else {
        const params = new URLSearchParams({
          phone,
          code,
          token: result.registrationToken,
        });
        router.push(`/register?${params.toString()}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
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
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Heading */}
      <p className="text-sm text-gray-500 font-medium">Verification</p>
      <h1 className="text-3xl font-bold text-primary mt-0.5">OTP Code</h1>

      {/* Illustration */}
      <div className="my-4">
        <AuthIllustration />
      </div>

      {/* Phone info */}
      <p className="text-sm text-gray-500 text-center mb-6">
        Enter the 4-digit code sent to{" "}
        <span className="font-bold text-gray-800">
          {code}
          {phone}
        </span>
      </p>

      {/* OTP boxes */}
      <div className="flex justify-center gap-4 mb-8" onPaste={handlePaste}>
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
            className="w-16 h-16 rounded-full border-2 text-center text-xl font-bold text-gray-800 focus:outline-none transition-colors"
            style={{
              borderColor: digit ? "hsl(24.6 95% 53.1%)" : "#E5E7EB",
              backgroundColor: "white",
            }}
          />
        ))}
      </div>

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={isPending || otp.length < 4}
        className="h-14 w-full rounded-full bg-primary text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:pointer-events-none"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Verifying…
          </>
        ) : (
          "Verify Code"
        )}
      </button>

      {/* Resend */}
      <p className="text-sm text-gray-400 text-center mt-6">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-primary font-semibold disabled:opacity-50"
        >
          {isResending ? "Resending…" : "Resend"}
        </button>
      </p>
    </div>
  );
}

export default function OtpPage(): React.JSX.Element {
  return (
    <Suspense>
      <OtpPageContent />
    </Suspense>
  );
}
