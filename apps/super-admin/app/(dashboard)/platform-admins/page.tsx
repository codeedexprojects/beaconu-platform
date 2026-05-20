"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  UserPlus,
  Shield,
  MoreVertical,
  Pencil,
  Trash2,
  Ban,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  usePlatformAdminsList,
  usePlatformAdminMutations,
} from "@/hooks/use-platform-admins-mgmt";
import { useRbac } from "@/hooks/use-rbac";
import { AdminFormModal } from "@/components/admins/AdminFormModal";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlatformAdminsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

  const { data: admins, isLoading } = usePlatformAdminsList();
  const { updateStatus, remove } = usePlatformAdminMutations();
  const { can } = useRbac();

  const canManage = can("platform.admins.manage");

  const handleEdit = (admin: any) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

  const handleDeleteAdmin = (admin: any) => {
    if (admin.platformRole?.slug === "super_admin") {
      toast.error("Super Admin users cannot be deleted");
      return;
    }

    toast("Delete this administrator?", {
      description: `Admin: ${admin.fullName}. This action will deactivate their account.`,
      action: {
        label: "Delete",
        onClick: () =>
          remove.mutate(admin.id, {
            onSuccess: () => {
              toast.success("Admin deleted");
            },
          }),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          return;
        },
      },
    });
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Platform Staff"
        description="Manage internal super admins and restricted access accounts"
      >
        {canManage && (
          <Button className="gap-2" onClick={handleCreate}>
            <UserPlus className="h-4 w-4" />
            Invite Staff
          </Button>
        )}
      </Header>

      <div className="p-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-10 w-[200px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[60px]" />
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <Skeleton className="h-8 w-8 ml-auto" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  : admins?.map((admin: any) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {admin.fullName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {admin.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1.5">
                            <Shield className="h-3 w-3" />
                            {admin.platformRole?.name || "No Role"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              admin.status === "active"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {admin.status}
                          </Badge>
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(admin)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus.mutate(
                                      {
                                        id: admin.id,
                                        status:
                                          admin.status === "active"
                                            ? "inactive"
                                            : "active",
                                      },
                                      {
                                        onSuccess: () => {
                                          toast.success("Status updated");
                                        },
                                      },
                                    )
                                  }
                                >
                                  {admin.status === "active" ? (
                                    <Ban className="h-4 w-4 mr-2" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                  )}
                                  {admin.status === "active"
                                    ? "Disable"
                                    : "Enable"}
                                </DropdownMenuItem>
                                {admin.platformRole?.slug !== "super_admin" && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteAdmin(admin)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AdminFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editAdmin={selectedAdmin}
      />
    </div>
  );
}
