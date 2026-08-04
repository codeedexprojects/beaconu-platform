"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Database,
  Mail,
  Lock,
  ChevronRight,
  Save,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePlatformConfig,
  useUpdatePlatformConfig,
} from "@/hooks/use-platform-config";

const systemConfigSchema = z.object({
  meetingGstPercentage: z.coerce
    .number()
    .min(0, "Must be ≥ 0")
    .max(100, "Must be ≤ 100"),
  counsellorMinWithdrawalAmount: z.coerce
    .number()
    .positive("Must be greater than zero"),
});
type SystemConfigInput = z.infer<typeof systemConfigSchema>;

const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile Settings", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security & Access", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "system", label: "System Configuration", icon: Database },
];

function SystemConfigurationSection() {
  const { data, isLoading, error } = usePlatformConfig();
  const { mutate, isPending } = useUpdatePlatformConfig();

  const form = useForm<SystemConfigInput>({
    resolver: zodResolver(systemConfigSchema),
    defaultValues: {
      meetingGstPercentage: 0,
      counsellorMinWithdrawalAmount: 0,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        meetingGstPercentage: data.meetingGstPercentage,
        counsellorMinWithdrawalAmount: data.counsellorMinWithdrawalAmount,
      });
    }
  }, [data, form]);

  function onSubmit(values: SystemConfigInput) {
    mutate(values, {
      onSuccess: () => {
        toast.success("Platform configuration updated");
      },
    });
  }

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl">
        <Database className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">
          Couldn&apos;t load configuration
        </h3>
        <p className="text-sm text-muted-foreground">
          Something went wrong. Please try again.
        </p>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">System Configuration</CardTitle>
        <CardDescription>
          Platform-wide values used for counselling session payouts. Other
          payment flows (e.g. Blink referral commissions) apply their own
          independent GST percentage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meetingGstPercentage">
              Meeting GST Percentage (%)
            </Label>
            <p className="text-xs text-muted-foreground">
              Applied to counselling session fee payments — charged when a
              student books a session and a meeting link is generated.
            </p>
            <Input
              id="meetingGstPercentage"
              type="number"
              step="0.01"
              {...form.register("meetingGstPercentage")}
            />
            {form.formState.errors.meetingGstPercentage && (
              <p className="text-sm text-destructive">
                {form.formState.errors.meetingGstPercentage.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="counsellorMinWithdrawalAmount">
              Counsellor Minimum Withdrawal Amount (₹)
            </Label>
            <Input
              id="counsellorMinWithdrawalAmount"
              type="number"
              step="0.01"
              {...form.register("counsellorMinWithdrawalAmount")}
            />
            {form.formState.errors.counsellorMinWithdrawalAmount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.counsellorMinWithdrawalAmount.message}
              </p>
            )}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-end">
            <Button type="submit" className="gap-2" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Settings"
        description="Configure platform-wide settings and your personal preferences"
      />

      <div className="flex-1 p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 space-y-1">
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">
            {activeSection === "profile" && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Platform Administrator Profile
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Full Name</Label>
                      <Input id="firstName" defaultValue="Super Admin" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        defaultValue="admin@beaconu.com"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Administrative Role</Label>
                    <Input
                      id="bio"
                      defaultValue="Platform Super Administrator"
                      disabled
                    />
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-end">
                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "notifications" && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Control how and when you receive platform alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Student Registration</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive alerts when a new student joins
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Agency Approval Requests</Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified about new associate admin signups
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Health Alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Critical infrastructure and API monitoring
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "security" && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Security & Privacy</CardTitle>
                  <CardDescription>
                    Manage your authentication and account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-11 px-4"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Change Password</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-11 px-4"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Two-Factor Authentication</span>
                    </div>
                    <Badge variant="warning">Off</Badge>
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "appearance" && (
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl">
                <Settings className="h-10 w-10 text-muted-foreground mb-4 animate-spin-slow" />
                <h3 className="text-lg font-semibold">Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  This settings module is currently under development.
                </p>
              </div>
            )}

            {activeSection === "system" && <SystemConfigurationSection />}
          </div>
        </div>
      </div>
    </div>
  );
}
