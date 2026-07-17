"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, Mail, Shield, Eye, Building2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProfiles } from "@/hooks/use-admins";

export default function BlinkUsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useAdminProfiles();
  const users = data?.blinkUsers ?? [];

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.agencyName &&
        user.agencyName.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Blink Users"
        description="Manage all active Associate Admins and Employees in the system"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Agency/Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-12 w-[250px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No Blink users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="group cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => router.push(`/blink/users/${user.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.fullName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              {user.fullName}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-3.5 w-3.5" />
                          {user.blinkRole?.name || "User"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {user.agencyName || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
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
                          className="capitalize px-2.5"
                        >
                          {user.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/blink/users/${user.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
