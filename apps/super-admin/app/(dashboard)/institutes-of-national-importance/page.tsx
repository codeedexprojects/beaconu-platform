"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Landmark, Search, Plus, MoreHorizontal, Edit, X } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconPickerField } from "@/components/icon-picker";
import {
  useInstitutesOfNationalImportance,
  useCreateInstituteOfNationalImportance,
  useUpdateInstituteOfNationalImportance,
  useDeactivateInstituteOfNationalImportance,
  useActivateInstituteOfNationalImportance,
} from "@/hooks/use-institutes-of-national-importance";
import type { InstituteOfNationalImportanceItem } from "@beaconu/types";

interface InstituteForm {
  name: string;
  icon_url: string;
  colleges_count: string;
}

const EMPTY_FORM: InstituteForm = {
  name: "",
  icon_url: "",
  colleges_count: "0",
};

export default function InstitutesOfNationalImportancePage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useInstitutesOfNationalImportance({
    search: search || undefined,
    limit: 100,
  });
  const institutes = data?.data ?? [];
  const meta = data?.meta;
  const createMutation = useCreateInstituteOfNationalImportance();
  const updateMutation = useUpdateInstituteOfNationalImportance();
  const deactivateMutation = useDeactivateInstituteOfNationalImportance();
  const activateMutation = useActivateInstituteOfNationalImportance();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInstitute, setEditingInstitute] =
    useState<InstituteOfNationalImportanceItem | null>(null);
  const [form, setForm] = useState<InstituteForm>(EMPTY_FORM);

  const handleToggleStatus = (institute: InstituteOfNationalImportanceItem) => {
    if (institute.isActive) {
      deactivateMutation.mutate(institute.id, {
        onSuccess: () => toast.success("Institute deactivated successfully"),
      });
    } else {
      activateMutation.mutate(institute.id, {
        onSuccess: () => toast.success("Institute activated successfully"),
      });
    }
  };

  const handleCreateClick = () => {
    setForm(EMPTY_FORM);
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (institute: InstituteOfNationalImportanceItem) => {
    setEditingInstitute(institute);
    setForm({
      name: institute.name,
      icon_url: institute.iconUrl ?? "",
      colleges_count: String(institute.collegesCount),
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        name: form.name,
        icon_url: form.icon_url || undefined,
        colleges_count: Number(form.colleges_count) || 0,
      },
      {
        onSuccess: () => {
          toast.success("Institute created successfully");
          setIsCreateModalOpen(false);
        },
      },
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstitute) return;
    updateMutation.mutate(
      {
        id: editingInstitute.id,
        data: {
          name: form.name,
          icon_url: form.icon_url || undefined,
          colleges_count: Number(form.colleges_count) || 0,
        },
      },
      {
        onSuccess: () => {
          toast.success("Institute updated successfully");
          setIsEditModalOpen(false);
        },
      },
    );
  };

  const activeCount = institutes.filter((i) => i.isActive).length;

  return (
    <div className="flex flex-col min-h-full relative">
      <Header
        title="Institutes of National Importance"
        description="Manage institutes of national importance shown on colleges"
      >
        <Button className="gap-2" onClick={handleCreateClick}>
          <Plus className="h-4 w-4" />
          Add Institute
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search institutes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Badge variant="info" className="px-3 py-1 gap-1.5">
            {activeCount}/{institutes.length} Active
          </Badge>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground font-medium">
                  Loading institutes...
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[80px]">Icon</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-center">Colleges</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No institutes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    institutes.map((institute) => (
                      <TableRow
                        key={institute.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors overflow-hidden">
                            {institute.iconUrl ? (
                              <img
                                src={institute.iconUrl}
                                alt={institute.name}
                                className="h-5 w-5 object-contain"
                              />
                            ) : (
                              <Landmark className="h-5 w-5" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-sm">
                            {institute.name}
                          </p>
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium">
                          {institute.collegesCount}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Switch
                              checked={institute.isActive}
                              onCheckedChange={() =>
                                handleToggleStatus(institute)
                              }
                            />
                            {institute.isActive ? (
                              <Badge
                                variant="success"
                                className="gap-1 h-5 text-[10px] px-1.5"
                              >
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="gap-1 h-5 text-[10px] px-1.5"
                              >
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-[160px]"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleEditClick(institute)}
                              >
                                <Edit className="h-4 w-4 text-muted-foreground" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {meta && meta.total > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {institutes.length} of {meta.total} institutes
          </p>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h3 className="font-semibold text-lg">Add Institute</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleCreate}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Name</Label>
                  <Input
                    id="create-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. IIT Delhi"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <IconPickerField
                    value={form.icon_url}
                    onChange={(iconUrl) =>
                      setForm((prev) => ({ ...prev, icon_url: iconUrl }))
                    }
                    uploadContext="institutes-of-national-importance"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-colleges-count">Colleges Count</Label>
                  <Input
                    id="create-colleges-count"
                    type="number"
                    min={0}
                    value={form.colleges_count}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        colleges_count: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 p-4 border-t bg-muted/20 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h3 className="font-semibold text-lg">Edit Institute</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleUpdate}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. IIT Delhi"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <IconPickerField
                    value={form.icon_url}
                    onChange={(iconUrl) =>
                      setForm((prev) => ({ ...prev, icon_url: iconUrl }))
                    }
                    uploadContext="institutes-of-national-importance"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-colleges-count">Colleges Count</Label>
                  <Input
                    id="edit-colleges-count"
                    type="number"
                    min={0}
                    value={form.colleges_count}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        colleges_count: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 p-4 border-t bg-muted/20 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
