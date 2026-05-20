"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ShieldCheck } from "lucide-react";
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
  useLoginCollegeAdmin,
  useSetupCollegeAccount,
  useVerifyCollegeSetupToken,
} from "@/hooks/use-auth";
import { usePublicCollegeBySlug } from "@/hooks/use-public-colleges";
import { useAuthStore } from "@/store";
import { getErrorMessage, ApiError } from "@/lib/api";
import {
  getCollegeSlugFromPath,
  getPortalPath,
  isCollegeRouteMismatch,
} from "@/lib/portal-path";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const setupSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SetupFormData = z.infer<typeof setupSchema>;

function getAuthToastMessage(error: unknown): string {
  if (error instanceof Error && !(error instanceof ApiError)) {
    return error.message;
  }

  const message = getErrorMessage(error).toLowerCase();

  if (message.includes("invalid") && message.includes("credential")) {
    return "Invalid email or password.";
  }

  if (message.includes("portal") || message.includes("college")) {
    return "Invalid credentials.";
  }

  return getErrorMessage(error);
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [collegeSlug, setCollegeSlug] = useState<string | null>(null);
  const { mutateAsync: loginCollegeAdmin, isPending: isLoginPending } =
    useLoginCollegeAdmin();
  const { mutateAsync: setupCollegeAccount, isPending: isSetupPending } =
    useSetupCollegeAccount();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema as any),
  });

  const setupForm = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema as any),
  });

  const { data: college, isLoading: isCollegeLoading } =
    usePublicCollegeBySlug(collegeSlug);
  const {
    data: validationData,
    error: setupError,
    isLoading: isValidating,
  } = useVerifyCollegeSetupToken(token);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (
      isCollegeRouteMismatch(window.location.pathname, window.location.host)
    ) {
      const expectedSlug = getCollegeSlugFromPath("/", window.location.host);
      router.replace(getPortalPath(expectedSlug, "/login"));
      return;
    }

    const slug = getCollegeSlugFromPath(
      window.location.pathname,
      window.location.host,
    );
    setCollegeSlug(slug);
  }, [router]);

  const onLoginSubmit = async (data: LoginFormData) => {
    if (!collegeSlug) {
      toast.error("Invalid portal link. Please use your college login URL.");
      return;
    }

    try {
      const response = await loginCollegeAdmin({
        ...data,
        collegeSlug,
      });

      if (
        collegeSlug &&
        response.user.collegeSlug.toLowerCase() !== collegeSlug.toLowerCase()
      ) {
        clearAuth();
        throw new Error("Invalid credentials.");
      }

      setAuth(response.user, response.token);
      toast.success("Welcome back!");
      const nextPath = getPortalPath(
        collegeSlug ?? response.user.collegeSlug ?? null,
        "/",
      );
      router.push(nextPath);
    } catch (error) {
      toast.error(getAuthToastMessage(error));
    }
  };

  const onSetupSubmit = async (data: SetupFormData) => {
    if (!token || !validationData) return;

    if (collegeSlug && validationData.collegeSlug !== collegeSlug) {
      toast.error("Invalid credentials.");
      return;
    }

    try {
      const response = await setupCollegeAccount({
        token,
        password: data.password,
      });

      setAuth(response.user, response.token);
      toast.success("Account setup successful!");
      router.push(getPortalPath(validationData.collegeSlug, "/setup/profile"));
    } catch (error) {
      toast.error(getAuthToastMessage(error));
    }
  };

  const displayName =
    college?.name ?? validationData?.collegeName ?? "College Admin";
  const logoUrl = college?.logoUrl ?? college?.university?.logoUrl ?? null;
  const isSetupMode = Boolean(token);

  if (isSetupMode && isValidating) {
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

  if (isSetupMode && (setupError || !validationData)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md shadow-lg border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Invalid Setup Link</CardTitle>
            <CardDescription className="text-destructive mt-2">
              {setupError
                ? getErrorMessage(setupError)
                : "This setup link is invalid or has expired."}
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
        <CardHeader className="space-y-3 text-center pb-8 pt-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-primary font-bold text-2xl">BU</span>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">{displayName}</CardTitle>
          <CardDescription>
            {isSetupMode
              ? "Create your password to activate the college portal"
              : "Enter your credentials to manage your college portal"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSetupMode ? (
            <form
              onSubmit={setupForm.handleSubmit(onSetupSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={validationData?.email ?? ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...setupForm.register("password")}
                />
                {setupForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {setupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...setupForm.register("confirmPassword")}
                />
                {setupForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {setupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isSetupPending}
              >
                {isSetupPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Complete Setup
              </Button>
            </form>
          ) : (
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="admin@college.edu"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isLoginPending || isCollegeLoading}
              >
                {isLoginPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sign In
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
