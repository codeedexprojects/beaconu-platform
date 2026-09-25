"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Loader2, MailCheck, KeyRound } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/hooks/use-auth";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";

const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [collegeSlug, setCollegeSlug] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { mutate, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema as any),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    setCollegeSlug(
      getCollegeSlugFromPath(window.location.pathname, window.location.host),
    );
  }, []);

  const loginHref = getPortalPath(collegeSlug, "/login");

  function onSubmit(data: ForgotFormData) {
    if (!collegeSlug) return;
    mutate(
      { email: data.email, collegeSlug },
      { onSuccess: () => setSentTo(data.email) },
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            {sentTo ? (
              <MailCheck className="h-8 w-8 text-primary" />
            ) : (
              <KeyRound className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {sentTo ? "Check your email" : "Forgot your password?"}
          </CardTitle>
          <CardDescription>
            {sentTo
              ? `If an account exists for ${sentTo}, we've sent a link to reset your password. It expires in 1 hour.`
              : "Enter your account email and we'll send you a link to reset your password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sentTo ? (
            <Button asChild className="w-full">
              <Link href={loginHref}>Back to sign in</Link>
            </Button>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isPending || !collegeSlug}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
              <div className="text-center">
                <Link
                  href={loginHref}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
