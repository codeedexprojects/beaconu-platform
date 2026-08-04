"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, Plus, MoreHorizontal, Edit, X } from "lucide-react";
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
import { useUpload } from "@/hooks/use-upload";
import {
  useIcons,
  useCreateIcon,
  useUpdateIcon,
  useDeactivateIcon,
  useActivateIcon,
} from "@/hooks/use-icons";
import type { IconItem } from "@beaconu/types";

interface IconForm {
  name: string;
  icon_url: string;
}

const EMPTY_FORM: IconForm = { name: "", icon_url: "" };

export default function IconsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useIcons({
    search: search || undefined,
    page,
    limit: 20,
  });
  const icons = data?.data ?? [];
  const meta = data?.meta;
  const createMutation = useCreateIcon();
  const updateMutation = useUpdateIcon();
  const deactivateMutation = useDeactivateIcon();
  const activateMutation = useActivateIcon();
  const { uploadFile, isUploading } = useUpload();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<IconItem | null>(null);
  const [form, setForm] = useState<IconForm>(EMPTY_FORM);

  const handleToggleStatus = (icon: IconItem) => {
    if (icon.isActive) {
      deactivateMutation.mutate(icon.id, {
        onSuccess: () => toast.success("Icon deactivated successfully"),
      });
    } else {
      activateMutation.mutate(icon.id, {
        onSuccess: () => toast.success("Icon activated successfully"),
      });
    }
  };

  const handleCreateClick = () => {
    setForm(EMPTY_FORM);
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (icon: IconItem) => {
    setEditingIcon(icon);
    setForm({ name: icon.name, icon_url: icon.iconUrl });
    setIsEditModalOpen(true);
  };

  const handleFileSelected = async (file: File) => {
    const url = await uploadFile(file, "icons");
    if (url) setForm((prev) => ({ ...prev, icon_url: url }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { name: form.name, icon_url: form.icon_url },
      {
        onSuccess: () => {
          toast.success("Icon created successfully");
          setIsCreateModalOpen(false);
        },
      },
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIcon) return;
    updateMutation.mutate(
      {
        id: editingIcon.id,
        data: { name: form.name, icon_url: form.icon_url },
      },
      {
        onSuccess: () => {
          toast.success("Icon updated successfully");
          setIsEditModalOpen(false);
        },
      },
    );
  };

  const activeCount = icons.filter((i) => i.isActive).length;

  return (
    <div className="flex flex-col min-h-full relative">
      <Header
        title="Icons"
        description="Manage reusable icons for the platform"
      >
        <Button className="gap-2" onClick={handleCreateClick}>
          <Plus className="h-4 w-4" />
          Add Icon
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-background"
              />
            </div>
          </div>
          <Badge variant="info" className="px-3 py-1 gap-1.5">
            {activeCount}/{icons.length} Active
          </Badge>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground font-medium">
                  Loading icons...
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[80px]">Preview</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {icons.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No icons found
                      </TableCell>
                    </TableRow>
                  ) : (
                    icons.map((icon) => (
                      <TableRow
                        key={icon.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted overflow-hidden">
                            <img
                              src={icon.iconUrl}
                              alt={icon.name}
                              className="h-6 w-6 object-contain"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-sm">{icon.name}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Switch
                              checked={icon.isActive}
                              onCheckedChange={() => handleToggleStatus(icon)}
                            />
                            {icon.isActive ? (
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
                                onClick={() => handleEditClick(icon)}
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

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Add Icon</h3>
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
                  <Label htmlFor="create-name">Icon Name</Label>
                  <Input
                    id="create-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Hostel, Library, Wifi"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-file">Icon Image</Label>
                  <Input
                    id="create-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFileSelected(file);
                    }}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <p className="text-xs text-muted-foreground">
                      Uploading...
                    </p>
                  )}
                  {form.icon_url && !isUploading && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted overflow-hidden">
                      <img
                        src={form.icon_url}
                        alt="Preview"
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  )}
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
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || isUploading || !form.icon_url
                  }
                >
                  {createMutation.isPending ? "Creating..." : "Create Icon"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Edit Icon</h3>
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
                  <Label htmlFor="edit-name">Icon Name</Label>
                  <Input
                    id="edit-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Hostel, Library, Wifi"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-file">Icon Image</Label>
                  <Input
                    id="edit-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFileSelected(file);
                    }}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <p className="text-xs text-muted-foreground">
                      Uploading...
                    </p>
                  )}
                  {form.icon_url && !isUploading && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted overflow-hidden">
                      <img
                        src={form.icon_url}
                        alt="Preview"
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  )}
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
                <Button
                  type="submit"
                  disabled={
                    updateMutation.isPending || isUploading || !form.icon_url
                  }
                >
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
