"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SampleLoginPage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    // 1. Email Format Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      setError("Please enter your student email address.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address (e.g. name@college.edu).");
      return;
    }

    // 2. Password Length Check
    if (!trimmedPass) {
      setError("Please enter your login password.");
      return;
    }
    if (trimmedPass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    // Dynamic placeholder response simulation
    window.setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10 bg-card/90 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            Sample Student Login
          </CardTitle>
          <CardDescription>
            Secure access portal for student details & admissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="student@college.edu"
                disabled={isLoading}
                className={
                  error && !email.trim()
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                disabled={isLoading}
                className={
                  error && password.length < 6
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-semibold animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign In (Sample)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
