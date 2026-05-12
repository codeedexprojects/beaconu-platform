"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Plus,
  MoreVertical,
  Mail,
  UserPlus,
  Shield,
  Key,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  getAdminProfiles,
  type PlatformAdmin,
} from "@/lib/services/admins.service";
import { approveEmployee } from "@/lib/services/associate-admins.service";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<PlatformAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setIsLoading(true);
    try {
      const data = await getAdminProfiles();
      if (data.platformAdmins.length > 0) {
        setAdmins(data.platformAdmins);
      } else {
        setAdmins(
          data.blinkUsers.map((user) => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            status: user.status,
            platformRole: user.blinkRole,
            lastLoginAt: undefined,
            createdAt: user.createdAt,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusUpdate(id: string, status: "active" | "rejected") {
    try {
      await approveEmployee(id, status);
      toast.success(
        `User ${status === "active" ? "approved" : "rejected"} successfully`,
      );
      fetchAdmins();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update user status");
    }
  }

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.fullName.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Platform Admins"
        description="Manage internal administrative accounts and access levels"
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdmins}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <UserPlus className="h-4 w-4" />
            Invite Admin
          </Button>
        </div>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search admins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-10 w-[200px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[60px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No administrators found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow
                      key={admin.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {admin.fullName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              {admin.fullName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {admin.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-3.5 w-3.5" />
                          {admin.platformRole?.name || "Admin"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {admin.lastLoginAt
                            ? new Date(admin.lastLoginAt).toLocaleDateString()
                            : "Never"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            admin.status === "active"
                              ? "success"
                              : admin.status === "pending_approval"
                                ? "warning"
                                : admin.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                          }
                          className="capitalize px-2.5"
                        >
                          {admin.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {admin.status === "pending_approval" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() =>
                                  handleStatusUpdate(admin.id, "active")
                                }
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() =>
                                  handleStatusUpdate(admin.id, "rejected")
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
