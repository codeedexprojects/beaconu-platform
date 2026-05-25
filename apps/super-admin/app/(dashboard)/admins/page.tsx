"use client";

import { useState } from "react";
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
import { Check, X, Shield, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAdminProfiles } from "@/hooks/use-admins";
import { useApproveEmployee } from "@/hooks/use-associate-admins";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlinkUsersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminProfiles();
  const approveMutation = useApproveEmployee();

  const blinkUsers = data?.blinkUsers || [];
  const filteredUsers = blinkUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleStatusUpdate = (id: string, status: "active" | "rejected") => {
    approveMutation.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`User ${status} successfully`),
      },
    );
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Blink Management"
        description="Manage external associate admins and partners"
      />

      <div className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                  : filteredUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.fullName}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {user.agencyName || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Shield className="h-3 w-3" />
                            {user.blinkRole?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "active"
                                ? "success"
                                : user.status === "pending_approval"
                                  ? "warning"
                                  : "destructive"
                            }
                          >
                            {user.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {user.status === "pending_approval" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-emerald-600"
                                onClick={() =>
                                  handleStatusUpdate(user.id, "active")
                                }
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                                onClick={() =>
                                  handleStatusUpdate(user.id, "rejected")
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
