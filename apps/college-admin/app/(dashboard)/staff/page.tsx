"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
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
  Eye,
  EyeOff,
  Pencil,
  MonitorSmartphone,
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { useCollegeRoles } from "@/hooks/use-roles";
import {
  useStaffDirectory,
  useInviteStaffMember,
  useUpdateStaffMember,
} from "@/hooks/use-roles";
import { useAuthStore } from "@/store";
import type { StaffMemberDto } from "@/lib/services/colleges.service";
import { StaffSessionsDialog } from "@/components/staff/staff-sessions-dialog";

const staffSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(255),
  email: z.string().trim().email("Enter a valid email address"),
  phoneNumber: z.string().trim().optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  collegeRoleId: z.string().min(1, "Please select a security role"),
});

type StaffFormData = z.infer<typeof staffSchema>;

const editStaffSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(255),
  email: z.string().trim().email("Enter a valid email address"),
  phoneNumber: z.string().trim().optional().nullable(),
  collegeRoleId: z.string().min(1, "Please select a security role"),
});

type EditStaffFormData = z.infer<typeof editStaffSchema>;

export default function StaffDirectoryPage() {
  const user = useAuthStore((state) => state.user);
  const { data: roles = [], isLoading: loadingRoles } = useCollegeRoles();
  const { data: staffList = [], isLoading: loadingStaff } = useStaffDirectory();
  const canManageStaff =
    user?.roleSlug === "college_admin" ||
    (user?.permissions?.includes("staff.manage") ?? false);
  const canManageSessions =
    user?.roleSlug === "college_admin" ||
    (user?.permissions?.includes("staff.sessions.manage") ?? false);

  const isSelf = (memberId: string) => memberId === user?.id;

  const { mutate: inviteStaff, isPending: inviting } = useInviteStaffMember();
  const { mutate: updateStaff, isPending: isUpdatingStaff } =
    useUpdateStaffMember();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMemberDto | null>(null);
  const [sessionsTarget, setSessionsTarget] = useState<StaffMemberDto | null>(
    null,
  );
  const [statusTarget, setStatusTarget] = useState<{
    id: string;
    name: string;
    nextStatus: "active" | "inactive";
  } | null>(null);

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

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditStaffFormData>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      collegeRoleId: "",
    },
  });

  const handleToggleStatus = (
    id: string,
    currentStatus: "active" | "inactive",
    name: string,
  ) => {
    if (!canManageStaff || isSelf(id)) return;
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    setStatusTarget({ id, name, nextStatus });
  };

  const confirmToggleStatus = () => {
    if (!statusTarget) return;
    updateStaff(
      { id: statusTarget.id, data: { status: statusTarget.nextStatus } },
      {
        onSuccess: () => {
          toast.success(
            `Staff status for "${statusTarget.name}" updated to ${statusTarget.nextStatus}`,
          );
          setStatusTarget(null);
        },
      },
    );
  };

  const handleRoleChange = (id: string, roleId: string, name: string) => {
    if (!canManageStaff || isSelf(id)) return;
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

  const handleOpenEdit = (member: StaffMemberDto) => {
    if (!canManageStaff || isSelf(member.id)) return;
    setEditTarget(member);
    resetEdit({
      fullName: member.fullName,
      email: member.email,
      phoneNumber: member.phoneNumber ?? "",
      collegeRoleId: member.collegeRoleId,
    });
  };

  const onEditSubmit = (data: EditStaffFormData) => {
    if (!editTarget) return;
    updateStaff(
      { id: editTarget.id, data },
      {
        onSuccess: () => {
          toast.success(`Staff member "${data.fullName}" updated`);
          setEditTarget(null);
        },
      },
    );
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

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <select
                          className="rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none"
                          value={member.collegeRoleId}
                          disabled={!canManageStaff || isSelf(member.id)}
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

                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        {canManageSessions && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setSessionsTarget(member)}
                          >
                            <MonitorSmartphone className="mr-1 h-3 w-3" />
                            Sessions
                          </Button>
                        )}
                        {canManageStaff && !isSelf(member.id) ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => handleOpenEdit(member)}
                            >
                              <Pencil className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
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
                          </>
                        ) : null}
                      </div>
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
                  <Label htmlFor="staff-phone">Phone Number </Label>
                  <Input
                    id="staff-phone"
                    placeholder="e.g. +91 98765 43210"
                    {...register("phoneNumber")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-pass">Initial Login Password</Label>
                  <div className="relative">
                    <Input
                      id="staff-pass"
                      type={showStaffPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      aria-label={
                        showStaffPassword ? "Hide password" : "Show password"
                      }
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setShowStaffPassword((v) => !v)}
                    >
                      {showStaffPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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

      {/* Edit Staff Modal */}
      {editTarget && canManageStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-2xl border-border bg-card/90">
            <CardHeader>
              <CardTitle>Edit Staff Member</CardTitle>
              <CardDescription>
                Update profile details and role assignment for{" "}
                {editTarget.fullName}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleEditSubmit(onEditSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="edit-staff-name">Full Name</Label>
                  <Input
                    id="edit-staff-name"
                    placeholder="e.g. John Doe"
                    {...registerEdit("fullName")}
                  />
                  {editErrors.fullName && (
                    <p className="text-xs text-destructive">
                      {editErrors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-staff-email">Email Address</Label>
                  <Input
                    id="edit-staff-email"
                    placeholder="e.g. john@college.edu"
                    {...registerEdit("email")}
                  />
                  {editErrors.email && (
                    <p className="text-xs text-destructive">
                      {editErrors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-staff-phone">Phone Number</Label>
                  <Input
                    id="edit-staff-phone"
                    placeholder="e.g. +91 98765 43210"
                    {...registerEdit("phoneNumber")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-staff-role">Role Scope Binding</Label>
                  <select
                    id="edit-staff-role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    {...registerEdit("collegeRoleId")}
                  >
                    <option value="">Select a security role...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {editErrors.collegeRoleId && (
                    <p className="text-xs text-destructive">
                      {editErrors.collegeRoleId.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditTarget(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdatingStaff}>
                    {isUpdatingStaff && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={statusTarget !== null}
        title="Update Staff Status"
        description={
          statusTarget
            ? `Are you sure you want to mark staff member "${statusTarget.name}" as ${statusTarget.nextStatus === "active" ? "ACTIVE" : "SUSPENDED"}?`
            : ""
        }
        confirmLabel="Confirm"
        variant={
          statusTarget?.nextStatus === "inactive" ? "destructive" : "default"
        }
        loading={isUpdatingStaff}
        onCancel={() => setStatusTarget(null)}
        onConfirm={confirmToggleStatus}
      />

      {sessionsTarget && (
        <StaffSessionsDialog
          staffId={sessionsTarget.id}
          staffName={sessionsTarget.fullName}
          onClose={() => setSessionsTarget(null)}
        />
      )}
    </div>
  );
}
