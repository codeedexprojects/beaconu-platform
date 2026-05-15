"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePlatformRoles,
  usePlatformPermissions,
  useCreatePlatformRole,
  useUpdateRolePermissions,
  useDeletePlatformRole,
} from "@/hooks/use-roles";
import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from "@/hooks/use-permissions";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";

type FormState = {
  name: string;
  slug: string;
  permissions: string[];
};

const initialFormState: FormState = {
  name: "",
  slug: "",
  permissions: [],
};

function toRoleSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

interface PermissionsSelectProps {
  availablePermissions: string[];
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  placeholder?: string;
}

function PermissionsSelect({
  availablePermissions,
  selectedPermissions,
  onChange,
  placeholder = "Select permissions...",
}: PermissionsSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const togglePermission = (permission: string) => {
    const updated = selectedPermissions.includes(permission)
      ? selectedPermissions.filter((p) => p !== permission)
      : [...selectedPermissions, permission];
    onChange(updated);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="flex flex-1 flex-wrap gap-1">
          {selectedPermissions.length > 0 ? (
            selectedPermissions.map((perm) => (
              <Badge key={perm} variant="secondary" className="text-xs">
                {perm}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <svg
          className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 border border-input rounded-md bg-popover shadow-md">
          <div className="max-h-64 overflow-y-auto p-2">
            {availablePermissions.length > 0 ? (
              availablePermissions.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="h-4 w-4 rounded border-input cursor-pointer"
                  />
                  <span className="text-sm flex-1">{permission}</span>
                </label>
              ))
            ) : (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                No permissions available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RolesPage() {
  const { data: roles = [], isLoading: rolesLoading } = usePlatformRoles();
  const { data: availablePermissions = [], isLoading: permsLoading } =
    usePlatformPermissions();
  const isLoading = rolesLoading || permsLoading;

  const createRoleMutation = useCreatePlatformRole();
  const updatePermissionsMutation = useUpdateRolePermissions();
  const deleteRoleMutation = useDeletePlatformRole();

  const [createForm, setCreateForm] = useState<FormState>(initialFormState);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);

  // Permission CRUD state
  const { data: permissions = [], isLoading: permissionsLoading } =
    usePermissions();
  const createPermissionMutation = useCreatePermission();
  const updatePermissionMutation = useUpdatePermission();
  const deletePermissionMutation = useDeletePermission();

  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [editingPermissionId, setEditingPermissionId] = useState<string | null>(
    null,
  );
  const [permissionForm, setPermissionForm] = useState({
    code: "",
    description: "",
  });

  const roleCountLabel = useMemo(() => {
    if (isLoading) return "Loading...";
    return `${roles.length} roles`;
  }, [isLoading, roles.length]);

  function handleCreateRole() {
    const name = createForm.name.trim();
    const slug = toRoleSlug(createForm.slug);

    if (!name) {
      toast.error("Role name is required");
      return;
    }

    if (!slug) {
      toast.error("Role slug is required");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(slug)) {
      toast.error(
        "Role slug can only contain lowercase letters, numbers, and underscores",
      );
      return;
    }

    createRoleMutation.mutate(
      {
        name,
        slug,
        permissions: createForm.permissions,
        is_system_role: false,
      },
      {
        onSuccess: () => {
          toast.success("Role created successfully");
          setCreateForm(initialFormState);
          setIsSlugEdited(false);
        },
      },
    );
  }

  function handleStartEdit(role: { id: string; permissions: string[] }) {
    setEditingRoleId(role.id);
    setEditingPermissions(role.permissions);
  }

  function handleSavePermissions(roleId: string) {
    updatePermissionsMutation.mutate(
      { roleId, payload: { permissions: editingPermissions } },
      {
        onSuccess: () => {
          toast.success("Role permissions updated");
          setEditingRoleId(null);
          setEditingPermissions([]);
        },
      },
    );
  }

  function handleCreatePermission() {
    if (!permissionForm.code.trim()) {
      toast.error("Permission code is required");
      return;
    }
    createPermissionMutation.mutate(permissionForm, {
      onSuccess: () => {
        setIsAddingPermission(false);
        setPermissionForm({ code: "", description: "" });
      },
    });
  }

  function handleUpdatePermission(id: string) {
    if (!permissionForm.code.trim()) {
      toast.error("Permission code is required");
      return;
    }
    updatePermissionMutation.mutate(
      { id, payload: permissionForm },
      {
        onSuccess: () => {
          setEditingPermissionId(null);
          setPermissionForm({ code: "", description: "" });
        },
      },
    );
  }

  function handleDeletePermission(id: string) {
    toast("Delete this permission?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => deletePermissionMutation.mutate(id),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          return;
        },
      },
    });
  }

  function handleDeleteRole(role: {
    id: string;
    name: string;
    slug: string;
    isSystemRole: boolean;
  }) {
    toast("Delete this role?", {
      description: `Role: ${role.name}. This action cannot be undone.`,
      action: {
        label: "Delete",
        onClick: () => {
          deleteRoleMutation.mutate(role.id, {
            onSuccess: () => {
              toast.success("Role deleted successfully");
            },
          });
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          return;
        },
      },
    });
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header
        title="Roles"
        description="Create platform roles and update their permissions using admin APIs"
      />

      <div className="flex-1 space-y-4 p-6">
        <div className="flex justify-end">
          <Badge variant="outline" className="px-3 py-1">
            {roleCountLabel}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Role Name
                </label>
                <input
                  type="text"
                  placeholder="Role name"
                  value={createForm.name}
                  onChange={(e) => {
                    const nextName = e.target.value;
                    setCreateForm((prev) => ({
                      ...prev,
                      name: nextName,
                      slug: isSlugEdited ? prev.slug : toRoleSlug(nextName),
                    }));
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Role Slug
                </label>
                <input
                  type="text"
                  placeholder="Role slug"
                  value={createForm.slug}
                  onChange={(e) => {
                    setIsSlugEdited(true);
                    setCreateForm((prev) => ({
                      ...prev,
                      slug: toRoleSlug(e.target.value),
                    }));
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Permissions
              </label>
              <PermissionsSelect
                availablePermissions={availablePermissions}
                selectedPermissions={createForm.permissions}
                onChange={(permissions) =>
                  setCreateForm((prev) => ({ ...prev, permissions }))
                }
                placeholder="Select permissions..."
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleCreateRole}
                disabled={isLoading || createRoleMutation.isPending}
              >
                {createRoleMutation.isPending ? "Creating..." : "Create Role"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-[160px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[120px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="ml-auto h-8 w-[110px]" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-20 text-center text-muted-foreground"
                    >
                      No roles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => {
                    const isEditing = editingRoleId === role.id;
                    return (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          {role.name}
                        </TableCell>
                        <TableCell>{role.slug}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              role.isSystemRole ? "secondary" : "outline"
                            }
                          >
                            {role.isSystemRole ? "System" : "Custom"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <PermissionsSelect
                              availablePermissions={availablePermissions}
                              selectedPermissions={editingPermissions}
                              onChange={setEditingPermissions}
                              placeholder="Select permissions..."
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {role.permissions.length
                                ? role.permissions.join(", ")
                                : "No permissions assigned"}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingRoleId(null);
                                  setEditingPermissions([]);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSavePermissions(role.id)}
                                disabled={updatePermissionsMutation.isPending}
                              >
                                {updatePermissionsMutation.isPending
                                  ? "Saving..."
                                  : "Save"}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartEdit(role)}
                              >
                                Edit Permissions
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-destructive"
                                onClick={() => handleDeleteRole(role)}
                                disabled={deleteRoleMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Available Permissions</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAddingPermission(true);
                setEditingPermissionId(null);
                setPermissionForm({ code: "", description: "" });
              }}
              disabled={isAddingPermission}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Permission
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAddingPermission && (
              <div className="flex flex-col gap-3 rounded-lg border p-4 bg-muted/30">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">
                      Permission Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. users.view"
                      value={permissionForm.code}
                      onChange={(e) =>
                        setPermissionForm((prev) => ({
                          ...prev,
                          code: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "."),
                        }))
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="What this permission allows"
                      value={permissionForm.description}
                      onChange={(e) =>
                        setPermissionForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingPermission(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreatePermission}
                    disabled={createPermissionMutation.isPending}
                  >
                    {createPermissionMutation.isPending ? "Adding..." : "Add"}
                  </Button>
                </div>
              </div>
            )}

            {isLoading || permissionsLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : permissions.length ? (
              <div className="grid gap-2">
                {permissions.map((permission) => {
                  const isEditing = editingPermissionId === permission.id;
                  return (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/50 transition-colors"
                    >
                      {isEditing ? (
                        <div className="flex flex-1 gap-2 items-center">
                          <input
                            type="text"
                            value={permissionForm.code}
                            onChange={(e) =>
                              setPermissionForm((prev) => ({
                                ...prev,
                                code: e.target.value,
                              }))
                            }
                            className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
                          />
                          <input
                            type="text"
                            value={permissionForm.description}
                            placeholder="Description"
                            onChange={(e) =>
                              setPermissionForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-green-600"
                            onClick={() =>
                              handleUpdatePermission(permission.id)
                            }
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setEditingPermissionId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <code className="text-sm font-semibold text-primary">
                              {permission.code}
                            </code>
                            {permission.description && (
                              <span className="text-xs text-muted-foreground">
                                {permission.description}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingPermissionId(permission.id);
                                setPermissionForm({
                                  code: permission.code,
                                  description: permission.description || "",
                                });
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() =>
                                handleDeletePermission(permission.id)
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No permissions found. Click &quot;Add Permission&quot; to create
                one.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
