"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  Building2,
  Calendar,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProfiles } from "@/hooks/use-admins";

export function BlinkUserDetailView({ userId }: { userId: string }) {
  const { data, isLoading } = useAdminProfiles();
  const user = data?.blinkUsers.find((u) => u.id === userId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/blink/users">
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Back to Blink Users
          </Link>
        </Button>
        <div className="text-sm text-destructive">Blink user not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title={user.fullName} description="Blink user profile">
        <Button variant="outline" size="sm" asChild>
          <Link href="/blink/users">
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Back
          </Link>
        </Button>
      </Header>

      <div className="flex-1 space-y-6 p-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold">{user.fullName}</h2>
                <Badge
                  variant={
                    user.status === "active"
                      ? "success"
                      : user.status === "pending_approval"
                        ? "warning"
                        : user.status === "rejected"
                          ? "destructive"
                          : "secondary"
                  }
                  className="capitalize"
                >
                  {user.status.replace("_", " ")}
                </Badge>
                {user.blinkRole?.name && (
                  <Badge variant="outline" className="capitalize">
                    {user.blinkRole.name}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {user.email}
                </span>
                {user.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {user.phoneNumber}
                  </span>
                )}
                {user.agencyName && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {user.agencyName}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold">Details</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Full Name</dt>
                <dd className="mt-0.5 font-medium">{user.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="mt-0.5 font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="mt-0.5 font-medium">
                  {user.phoneNumber || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Role</dt>
                <dd className="mt-0.5 font-medium flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  {user.blinkRole?.name || "User"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  Agency/Company
                </dt>
                <dd className="mt-0.5 font-medium">
                  {user.agencyName || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="mt-0.5 font-medium capitalize">
                  {user.status.replace("_", " ")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Joined On</dt>
                <dd className="mt-0.5 font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
