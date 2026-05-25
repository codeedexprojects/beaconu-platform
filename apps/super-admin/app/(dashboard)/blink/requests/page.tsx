"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, RefreshCw, Check, X, Mail, Shield } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingBlinkUsers } from "@/hooks/use-admins";
import { useApproveEmployee } from "@/hooks/use-associate-admins";

export default function RegistrationRequestsPage() {
  const [search, setSearch] = useState("");

  const { data: requests = [], isLoading, refetch } = usePendingBlinkUsers();
  const approveMutation = useApproveEmployee();

  function handleStatusUpdate(id: string, status: "active" | "rejected") {
    approveMutation.mutate(
      { id, status },
      {
        onSuccess: () =>
          toast.success(
            `User ${status === "active" ? "approved" : "rejected"} successfully`,
          ),
      },
    );
  }

  const filteredRequests = requests.filter(
    (req) =>
      req.fullName.toLowerCase().includes(search.toLowerCase()) ||
      req.email.toLowerCase().includes(search.toLowerCase()) ||
      (req.agencyName &&
        req.agencyName.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Registration Requests"
        description="Review and approve new Associate Admins and Employees"
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
            placeholder="Search requests..."
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
                  <TableHead>Agency/Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date Applied</TableHead>
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
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No pending registration requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <TableRow
                      key={req.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                            {req.fullName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              {req.fullName}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {req.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {req.agencyName || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-3.5 w-3.5" />
                          {req.blinkRole?.name || "User"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800"
                            onClick={() => handleStatusUpdate(req.id, "active")}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                            onClick={() =>
                              handleStatusUpdate(req.id, "rejected")
                            }
                            disabled={approveMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
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
