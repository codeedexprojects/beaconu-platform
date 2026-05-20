"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UserPlus,
  Loader2,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Lock,
  ArrowRight,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useCollegeRoles } from "@/hooks/use-roles";
import {
  useStaffDirectory,
  useInviteStaffMember,
  useUpdateStaffMember,
} from "@/hooks/use-roles";
import { useAuthStore } from "@/store";

const staffSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(255),
  email: z.string().trim().email("Enter a valid email address"),
  phoneNumber: z.string().trim().optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  collegeRoleId: z.string().uuid("Please select a security role"),
});

type StaffFormData = z.infer<typeof staffSchema>;

export default function StaffDirectoryPage() {
  const user = useAuthStore((state) => state.user);
  const { data: roles = [], isLoading: loadingRoles } = useCollegeRoles();
  const { data: staffList = [], isLoading: loadingStaff } = useStaffDirectory();
  const canManageStaff =
    user?.roleSlug === "college_admin" ||
    (user?.permissions?.includes("staff.manage") ?? false);

  const { mutate: inviteStaff, isPending: inviting } = useInviteStaffMember();
  const { mutate: updateStaff } = useUpdateStaffMember();

  const [showInviteModal, setShowInviteModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      collegeRoleId: "",
    },
  });

  const handleToggleStatus = (
    id: string,
    currentStatus: "active" | "inactive",
    name: string,
  ) => {
    if (!canManageStaff) return;
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    if (
      confirm(
        `Are you sure you want to mark staff member "${name}" as ${nextStatus === "active" ? "ACTIVE" : "SUSPENDED"}?`,
      )
    ) {
      updateStaff(
        { id, data: { status: nextStatus } },
        {
          onSuccess: () => {
            toast.success(
              `Staff status for "${name}" updated to ${nextStatus}`,
            );
          },
        },
      );
    }
  };

  const handleRoleChange = (id: string, roleId: string, name: string) => {
    if (!canManageStaff) return;
    updateStaff(
      { id, data: { collegeRoleId: roleId } },
      {
        onSuccess: () => {
          toast.success(`Staff role updated for "${name}"`);
        },
      },
    );
  };

  const onSubmit = (data: StaffFormData) => {
    inviteStaff(data, {
      onSuccess: () => {
        toast.success("Staff member invited successfully");
        setShowInviteModal(false);
        reset();
      },
    });
  };

  if (loadingRoles || loadingStaff) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage your internal department members, invite officers, and
            control active credentials.
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="shadow-lg shadow-primary/10"
          disabled={!canManageStaff}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Invite Staff Member
        </Button>
      </div>

      {/* Staff directory table listing */}
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="py-4 pl-6 font-semibold">
                    Staff Member
                  </TableHead>
                  <TableHead className="font-semibold">Security Role</TableHead>
                  <TableHead className="font-semibold">Access Status</TableHead>
                  <TableHead className="font-semibold">Joined At</TableHead>
                  <TableHead className="text-right pr-6 font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-b border-border/40 hover:bg-muted/10 transition-colors"
                  >
                    {/* User profile details cell */}
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary select-none">
                          {member.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {member.fullName}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Mail className="h-3 w-3" /> {member.email}
                            </span>
                            {member.phoneNumber && (
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Phone className="h-3 w-3" />{" "}
                                {member.phoneNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role allocation cell */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <select
                          className="rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none"
                          value={member.collegeRoleId}
                          disabled={!canManageStaff}
                          onChange={(e) =>
                            handleRoleChange(
                              member.id,
                              e.target.value,
                              member.fullName,
                            )
                          }
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </TableCell>

                    {/* Security credentials status */}
                    <TableCell>
                      {member.status === "active" ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-green-600 border-green-600 bg-green-50/50"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-destructive border-destructive bg-destructive/5"
                        >
                          Suspended
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </TableCell>

                    {/* Status switcher button */}
                    <TableCell className="text-right pr-6">
                      {canManageStaff ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-xs px-2.5 py-1 h-7 ${
                            member.status === "active"
                              ? "text-amber-600 hover:text-amber-700"
                              : "text-green-600 hover:text-green-700"
                          }`}
                          onClick={() =>
                            handleToggleStatus(
                              member.id,
                              member.status,
                              member.fullName,
                            )
                          }
                        >
                          {member.status === "active"
                            ? "Suspend"
                            : "Re-activate"}
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}

                {staffList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                      No staff members invited yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Staff Invitation Modal sheet */}
      {showInviteModal && canManageStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-2xl border-border bg-card/90">
            <CardHeader>
              <CardTitle>Invite Staff Member</CardTitle>
              <CardDescription>
                Allocate department roles and credential profiles for instant
                dashboard provisioning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-name">Full Name</Label>
                  <Input
                    id="staff-name"
                    placeholder="e.g. John Doe"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-email">Email Address</Label>
                  <Input
                    id="staff-email"
                    placeholder="e.g. john@college.edu"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-phone">Phone Number (Optional)</Label>
                  <Input
                    id="staff-phone"
                    placeholder="e.g. +91 98765 43210"
                    {...register("phoneNumber")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-pass">Initial Login Password</Label>
                  <Input
                    id="staff-pass"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-role">Role Scope Binding</Label>
                  <select
                    id="staff-role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    {...register("collegeRoleId")}
                  >
                    <option value="">Select a security role...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {errors.collegeRoleId && (
                    <p className="text-xs text-destructive">
                      {errors.collegeRoleId.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviting}>
                    {inviting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send Invitation
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
