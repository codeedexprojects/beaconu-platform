"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  Lock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store";

import {
  useCollegePermissions,
  useCollegeRoles,
  useCreateCollegeRole,
  useUpdateCollegeRole,
  useDeleteCollegeRole,
} from "@/hooks/use-roles";

const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Role name must be at least 2 characters")
    .max(100),
  permissionCodes: z.array(z.string()).min(1, "Select at least one permission"),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function RolesBuilderPage() {
  const user = useAuthStore((state) => state.user);
  const { data: permissions = [], isLoading: loadingPerms } =
    useCollegePermissions();
  const { data: roles = [], isLoading: loadingRoles } = useCollegeRoles();
  const canManageStaff =
    user?.roleSlug === "college_admin" ||
    (user?.permissions?.includes("staff.manage") ?? false);

  const { mutate: createRole, isPending: creating } = useCreateCollegeRole();
  const { mutate: updateRole, isPending: updating } = useUpdateCollegeRole();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteCollegeRole();

  const [editingRole, setEditingRole] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "", permissionCodes: [] },
  });

  const selectedPermissions = watch("permissionCodes") || [];

  const handleOpenCreate = () => {
    if (!canManageStaff) return;
    setEditingRole(null);
    reset({ name: "", permissionCodes: [] });
    setShowModal(true);
  };

  const handleOpenEdit = (role: any) => {
    if (!canManageStaff) return;
    setEditingRole(role);
    reset({
      name: role.name,
      permissionCodes: role.permissions,
    });
    setShowModal(true);
  };

  const togglePermission = (code: string) => {
    if (selectedPermissions.includes(code)) {
      setValue(
        "permissionCodes",
        selectedPermissions.filter((c) => c !== code),
      );
    } else {
      setValue("permissionCodes", [...selectedPermissions, code]);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!canManageStaff) return;
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteRole(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`Role "${deleteTarget.name}" deleted successfully`);
        setDeleteTarget(null);
      },
    });
  };

  const onSubmit = (data: RoleFormData) => {
    if (editingRole) {
      updateRole(
        {
          id: editingRole.id,
          data: {
            name: data.name,
            permissionCodes: data.permissionCodes,
          },
        },
        {
          onSuccess: () => {
            toast.success("Role updated successfully");
            setShowModal(false);
            reset();
          },
        },
      );
    } else {
      createRole(data, {
        onSuccess: () => {
          toast.success("Custom role created successfully");
          setShowModal(false);
          reset();
        },
      });
    }
  };

  if (loadingPerms || loadingRoles) {
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
          <h1 className="text-2xl font-bold tracking-tight">
            Role Builder & RBAC
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage custom department roles and granular access rules for your
            college staff members.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="shadow-lg shadow-primary/10"
          disabled={!canManageStaff}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Custom Role
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card
            key={role.id}
            className="border border-border/50 bg-card/60 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border/80"
          >
            {role.isSystemRole && (
              <div className="absolute top-0 right-0 bg-secondary/80 text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-bl">
                SYSTEM
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield
                  className={`h-5 w-5 ${role.isSystemRole ? "text-blue-500" : "text-amber-500"}`}
                />
                <CardTitle className="text-lg font-bold">{role.name}</CardTitle>
              </div>
              <CardDescription className="text-xs font-mono">
                {role.slug}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              {/* Permission code chips list */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Assigned Scopes
                </p>
                <div className="flex flex-wrap gap-1.5 min-h-[48px]">
                  {role.permissions.map((pCode: string) => (
                    <Badge
                      key={pCode}
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 font-mono"
                    >
                      {pCode}
                    </Badge>
                  ))}
                  {role.permissions.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">
                      No access scopes allocated
                    </span>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex justify-between items-center border-t border-border/40 pt-4 mt-2">
                <div className="flex items-center gap-1.5">
                  {role.isActive ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-green-600 border-green-600 bg-green-50/50"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-destructive border-destructive"
                    >
                      Suspended
                    </Badge>
                  )}
                </div>

                {canManageStaff ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleOpenEdit(role)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    {!role.isSystemRole && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(role.id, role.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Creation / Editing Modal Sheet */}
      {showModal && canManageStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-2xl border-border bg-card/90">
            <CardHeader>
              <CardTitle>
                {editingRole
                  ? `Edit Role: ${editingRole.name}`
                  : "Create Custom Role"}
              </CardTitle>
              <CardDescription>
                Define operational scopes and resource access controls.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    disabled={editingRole?.isSystemRole}
                    placeholder="e.g. Assistant Admission Officer"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Permissions selector list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">
                      Scope Allocations
                    </Label>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {selectedPermissions.length} / {permissions.length}{" "}
                      selected
                    </span>
                  </div>

                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 border rounded-lg p-2.5 bg-muted/20">
                    {permissions.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.code);
                      return (
                        <div
                          key={perm.code}
                          onClick={() => togglePermission(perm.code)}
                          className={`flex items-start gap-3 p-2.5 rounded-md border cursor-pointer select-none transition-all duration-200 ${
                            isChecked
                              ? "bg-primary/5 border-primary/40 shadow-sm"
                              : "border-border/40 hover:bg-muted/30"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // toggling is handled by div click
                            className="h-4.5 w-4.5 rounded border-gray-300 text-primary mt-0.5 focus:ring-primary"
                          />
                          <div>
                            <p className="text-xs font-bold font-mono text-foreground">
                              {perm.code}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                              {perm.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {errors.permissionCodes && (
                    <p className="text-xs text-destructive">
                      {errors.permissionCodes.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating || updating}>
                    {(creating || updating) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingRole ? "Save Changes" : "Create Role"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Role"
        description={
          deleteTarget
            ? `Are you absolutely sure you want to delete the custom role "${deleteTarget.name}"?`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
