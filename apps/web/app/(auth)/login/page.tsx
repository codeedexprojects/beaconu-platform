"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { sendStudentOtp } from "@/lib/services/student-auth.service";
import { AuthIllustration } from "../auth-illustration";

const loginSchema = z.object({
  phone_country_code: z.string().default("+91"),
  phone_number: z.string().trim().min(10, "Enter a valid phone number").max(15),
  whatsapp_updates: z.boolean().default(false),
});

type LoginInput = z.infer<typeof loginSchema>;

const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+61", label: "🇦🇺 +61" },
];

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone_country_code: "+91",
      phone_number: "",
      whatsapp_updates: false,
    },
  });

  async function onSubmit(data: LoginInput) {
    setIsPending(true);
    try {
      await sendStudentOtp(data.phone_number, data.phone_country_code);
      const params = new URLSearchParams({
        phone: data.phone_number,
        code: data.phone_country_code,
      });
      router.push(`/otp?${params.toString()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsPending(false);
    }
  }

  const phoneError = form.formState.errors.phone_number;

  return (
    <div className="flex flex-col">
      {/* Heading */}
      <p className="text-sm text-gray-500 font-medium">Welcome</p>
      <h1 className="text-3xl font-bold text-primary mt-0.5">Get Start</h1>

      {/* Illustration */}
      <div className="my-4">
        <AuthIllustration />
      </div>

      {/* Form */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Phone Number
          </label>
          <div className="flex items-center bg-gray-100 rounded-full px-4 h-14 gap-2">
            {/* Country code selector */}
            <div className="relative flex items-center gap-1 shrink-0">
              <select
                className="appearance-none bg-transparent text-sm font-medium text-gray-700 pr-4 cursor-pointer focus:outline-none"
                {...form.register("phone_country_code")}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300 shrink-0" />

            {/* Phone input */}
            <input
              type="tel"
              inputMode="numeric"
              placeholder="9876543210"
              autoComplete="tel"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              {...form.register("phone_number")}
            />
          </div>
          {phoneError && (
            <p className="text-xs text-red-500 px-1">{phoneError.message}</p>
          )}
        </div>

        {/* Forgot password link */}
        <div className="flex justify-end -mt-2">
          <button type="button" className="text-xs text-primary font-medium">
            Forgot Password?
          </button>
        </div>

        {/* Login button */}
        <button
          type="submit"
          disabled={isPending}
          className="h-14 w-full rounded-full bg-primary text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:pointer-events-none"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending OTP…
            </>
          ) : (
            "Login"
          )}
        </button>

        {/* WhatsApp checkbox */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="h-5 w-5 rounded accent-primary"
            {...form.register("whatsapp_updates")}
          />
          <span className="text-sm text-gray-600">
            I agree to receive updates over{" "}
            <span className="text-[#25D366] font-semibold">WhatsApp</span>
          </span>
        </label>

        {/* Or divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">Or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Alternative login buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-4 w-4 text-gray-500" />
            Email
          </button>
          <button
            type="button"
            className="flex-1 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
        </div>
      </form>
    </div>
  );
}
