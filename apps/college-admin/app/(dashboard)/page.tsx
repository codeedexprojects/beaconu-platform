"use client";

import { useState } from "react";
import { Copy, ExternalLink, Globe2 } from "lucide-react";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPublicPortalUrl } from "@/lib/portal-path";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [copied, setCopied] = useState(false);

  const publicPortalUrl = getPublicPortalUrl(user?.collegeSlug ?? null);
  const isActiveCollege = user?.collegeStatus === "active";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicPortalUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your college admin portal.
        </p>
      </div>

      <Card
        className={
          isActiveCollege
            ? "border-primary/10 shadow-sm"
            : "border-muted shadow-sm"
        }
      >
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className={
                isActiveCollege
                  ? "flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"
                  : "flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
              }
            >
              <Globe2
                className={
                  isActiveCollege
                    ? "h-4 w-4 text-primary"
                    : "h-4 w-4 text-muted-foreground"
                }
              />
            </div>
            <CardTitle className="text-base">
              Public college landing page
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {isActiveCollege
              ? "Share this link with your admissions team or add it to your website."
              : "This link will go live once registration is submitted from Review & Submit."}
          </p>
        </CardHeader>
        {isActiveCollege ? (
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={publicPortalUrl}
              readOnly
              className="font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button type="button" asChild>
                <a href={publicPortalUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </a>
              </Button>
            </div>
          </CardContent>
        ) : null}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
