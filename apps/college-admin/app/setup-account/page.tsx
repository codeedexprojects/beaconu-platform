"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

import {
  authService,
  type SetupTokenValidation,
} from "@/lib/services/auth.service";
import { useAuthStore } from "@/store";
import { getErrorMessage } from "@/lib/api";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";

const setupSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SetupFormData = z.infer<typeof setupSchema>;

function SetupAccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const setAuth = useAuthStore((state) => state.setAuth);
  const [collegeSlug, setCollegeSlug] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationData, setValidationData] =
    useState<SetupTokenValidation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema as any),
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCollegeSlug(
      getCollegeSlugFromPath(window.location.pathname, window.location.host),
    );
  }, []);

  useEffect(() => {
    if (!token) {
      setError("Setup token is missing. Please check your email link.");
      setIsValidating(false);
      return;
    }

    let isActive = true;

    authService
      .verifySetupToken(token)
      .then((data) => {
        if (isActive) {
          setValidationData(data);
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsValidating(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  const onSubmit = async (data: SetupFormData) => {
    if (!token || !validationData) return;

    setIsSubmitting(true);
    try {
      const response = await authService.setupAccount({
        token,
        password: data.password,
      });

      setAuth(response.user, response.token);
      toast.success("Account setup successful!");
      router.push(getPortalPath(validationData.collegeSlug, "/setup/profile"));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Validating secure setup link...
          </p>
        </div>
      </div>
    );
  }

  if (error || !validationData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md shadow-lg border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Invalid Setup Link</CardTitle>
            <CardDescription className="text-destructive mt-2">
              {error || "This setup link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push(getPortalPath(collegeSlug, "/login"))}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-2 text-center pb-8 pt-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Secure Your Account
          </CardTitle>
          <CardDescription>
            Set a password to complete registration for <br />
            <span className="font-semibold text-foreground">
              {validationData.collegeName}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={validationData.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetupAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SetupAccountPageContent />
    </Suspense>
  );
}
