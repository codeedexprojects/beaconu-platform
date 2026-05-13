"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Tag,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react";
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
import type { UniversityType } from "@/lib/services/university-types.service";
import {
  useUniversityTypes,
  useCreateUniversityType,
  useUpdateUniversityType,
  useDisableUniversityType,
  useRemoveUniversityType,
} from "@/hooks/use-university-types";

export default function UniversityTypesPage() {
  const [search, setSearch] = useState("");

  const { data: types = [], isLoading } = useUniversityTypes();
  const createMutation = useCreateUniversityType();
  const updateMutation = useUpdateUniversityType();
  const disableMutation = useDisableUniversityType();
  const removeMutation = useRemoveUniversityType();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<UniversityType | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", sort_order: 0 });

  const filteredTypes = useMemo(() => {
    return types.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, types]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this university type?")) {
      removeMutation.mutate(id, {
        onSuccess: () => toast.success("Type deleted successfully"),
      });
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    if (currentStatus) {
      disableMutation.mutate(id, {
        onSuccess: () => toast.success("Type disabled successfully"),
      });
    } else {
      updateMutation.mutate(
        { id, data: { is_active: true } },
        { onSuccess: () => toast.success("Type enabled successfully") },
      );
    }
  };

  const handleCreateClick = () => {
    setForm({ name: "", slug: "", sort_order: 0 });
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (type: UniversityType) => {
    setEditingType(type);
    setForm({
      name: type.name,
      slug: type.slug,
      sort_order: type.sortOrder,
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => {
        toast.success("University type created successfully");
        setIsCreateModalOpen(false);
      },
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    updateMutation.mutate(
      { id: editingType.id, data: form },
      {
        onSuccess: () => {
          toast.success("University type updated successfully");
          setIsEditModalOpen(false);
        },
      },
    );
  };

  const activeCount = filteredTypes.filter((t) => t.isActive).length;

  return (
    <div className="flex flex-col min-h-full relative">
      <Header
        title="University Types"
        description="Manage university classification types"
      >
        <Button className="gap-2" onClick={handleCreateClick}>
          <Plus className="h-4 w-4" />
          Add Type
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search university types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info" className="px-3 py-1 gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {activeCount}/{filteredTypes.length} Active
            </Badge>
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground font-medium">
                  Loading types...
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[250px]">Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-center">Sort Order</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTypes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No university types found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTypes.map((type) => (
                      <TableRow
                        key={type.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <Tag className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {type.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-mono"
                          >
                            {type.slug}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium">
                          {type.sortOrder}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Switch
                              checked={type.isActive}
                              onCheckedChange={() =>
                                handleToggleStatus(type.id, type.isActive)
                              }
                            />
                            {type.isActive ? (
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
                                onClick={() => handleEditClick(type)}
                              >
                                <Edit className="h-4 w-4 text-muted-foreground" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-destructive focus:text-destructive"
                                onClick={() => handleDelete(type.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
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
      </div>

      {/* Create Modal Overlay */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Add University Type</h3>
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
                  <Label htmlFor="create-name">Type Name</Label>
                  <Input
                    id="create-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Central University"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-slug">Slug</Label>
                  <Input
                    id="create-slug"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="e.g. central_university"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-sort">Sort Order</Label>
                  <Input
                    id="create-sort"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sort_order: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 p-4 border-t bg-muted/20">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Type"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Modal Overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Edit University Type</h3>
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
                  <Label htmlFor="edit-name">Type Name</Label>
                  <Input
                    id="edit-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Central University"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input
                    id="edit-slug"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="e.g. central_university"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sort">Sort Order</Label>
                  <Input
                    id="edit-sort"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sort_order: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 p-4 border-t bg-muted/20">
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
