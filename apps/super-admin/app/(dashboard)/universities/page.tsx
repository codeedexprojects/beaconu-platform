"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  GraduationCap,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Archive,
  MapPin,
  Loader2,
  X,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  universitiesService,
  University,
  CreateUniversityInput,
  UpdateUniversityInput,
} from "@/lib/services/universities.service";
import {
  universityTypesService,
  UniversityType,
} from "@/lib/services/university-types.service";
import { apiAction } from "@/lib/api";

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const EMPTY_CREATE_FORM: CreateUniversityInput = {
  university_type_id: "",
  name: "",
  slug: "",
  state: "",
  city: "",
  accreditation: "",
  governance_details: "",
  logo_url: "",
};

export default function UniversitiesPage() {
  const [search, setSearch] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [universityTypes, setUniversityTypes] = useState<UniversityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(
    null,
  );
  const [createForm, setCreateForm] =
    useState<CreateUniversityInput>(EMPTY_CREATE_FORM);
  const [editForm, setEditForm] = useState<UpdateUniversityInput>({});

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [unis, types] = await Promise.all([
        universitiesService.getAll(),
        universityTypesService.getAll(),
      ]);
      setUniversities(unis);
      setUniversityTypes(types);
    } catch (error) {
      console.error("Failed to fetch universities:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAll();
  }, [fetchAll]);

  const filteredUniversities = useMemo(() => {
    const q = search.toLowerCase();
    return universities.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.city ?? "").toLowerCase().includes(q) ||
        (u.state ?? "").toLowerCase().includes(q),
    );
  }, [search, universities]);

  const activeCount = filteredUniversities.filter(
    (u) => u.status === "active",
  ).length;

  const handleCreateNameChange = (value: string) => {
    setCreateForm((prev) => ({
      ...prev,
      name: value,
      slug: toSlug(value),
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateUniversityInput = {
      university_type_id: createForm.university_type_id,
      name: createForm.name,
      slug: createForm.slug,
      ...(createForm.state ? { state: createForm.state } : {}),
      ...(createForm.city ? { city: createForm.city } : {}),
      ...(createForm.accreditation
        ? { accreditation: createForm.accreditation }
        : {}),
      ...(createForm.governance_details
        ? { governance_details: createForm.governance_details }
        : {}),
      ...(createForm.logo_url ? { logo_url: createForm.logo_url } : {}),
    };
    const result = await apiAction(
      () => universitiesService.create(payload),
      "University created successfully",
    );
    if (result) {
      setIsCreateModalOpen(false);
      setCreateForm(EMPTY_CREATE_FORM);
      void fetchAll();
    }
  };

  const handleEditClick = (university: University) => {
    setEditingUniversity(university);
    setEditForm({
      university_type_id: university.universityType.id,
      name: university.name,
      slug: university.slug,
      state: university.state ?? "",
      city: university.city ?? "",
      accreditation: university.accreditation ?? "",
      governance_details: university.governanceDetails ?? "",
      logo_url: university.logoUrl ?? "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUniversity) return;
    const result = await apiAction(
      () => universitiesService.update(editingUniversity.id, editForm),
      "University updated successfully",
    );
    if (result) {
      setIsEditModalOpen(false);
      setEditingUniversity(null);
      void fetchAll();
    }
  };

  const handleArchive = async (id: string) => {
    if (
      !confirm(
        "Archive this university? It will no longer be visible publicly.",
      )
    )
      return;
    await apiAction(
      () => universitiesService.archive(id),
      "University archived",
    );
    void fetchAll();
  };

  return (
    <div className="flex flex-col min-h-full relative">
      <Header
        title="Universities"
        description="Manage university groups and their affiliated colleges"
      >
        <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add University
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {activeCount}/{filteredUniversities.length} Active
          </Badge>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">
                  Loading universities...
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[300px]">University</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Accreditation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUniversities.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No universities found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUniversities.map((university) => (
                      <TableRow
                        key={university.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm leading-none mb-1">
                                {university.name}
                              </p>
                              <p className="text-[10px] font-mono text-muted-foreground">
                                {university.slug}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-medium"
                          >
                            {university.universityType.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {university.city || university.state ? (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>
                                {[university.city, university.state]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {university.accreditation ? (
                            <span className="text-sm">
                              {university.accreditation}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              university.status === "active"
                                ? "success"
                                : university.status === "archived"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-[10px] capitalize"
                          >
                            {university.status}
                          </Badge>
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
                                onClick={() => handleEditClick(university)}
                              >
                                <Edit className="h-4 w-4 text-muted-foreground" />
                                Edit
                              </DropdownMenuItem>
                              {university.status !== "archived" && (
                                <DropdownMenuItem
                                  className="gap-2 text-destructive focus:text-destructive"
                                  onClick={() => handleArchive(university.id)}
                                >
                                  <Archive className="h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                              )}
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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Add University</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleCreate}>
              <CardContent className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="create-type">University Type</Label>
                  <Select
                    value={createForm.university_type_id}
                    onValueChange={(v: string) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        university_type_id: v,
                      }))
                    }
                    required
                  >
                    <SelectTrigger id="create-type">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {universityTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-name">Name</Label>
                  <Input
                    id="create-name"
                    value={createForm.name}
                    onChange={(e) => handleCreateNameChange(e.target.value)}
                    placeholder="e.g. Delhi University"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-slug">Slug</Label>
                  <Input
                    id="create-slug"
                    value={createForm.slug}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        slug: toSlug(e.target.value),
                      }))
                    }
                    placeholder="e.g. delhi-university"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-city">City</Label>
                    <Input
                      id="create-city"
                      value={createForm.city}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      placeholder="e.g. New Delhi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-state">State</Label>
                    <Input
                      id="create-state"
                      value={createForm.state}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      placeholder="e.g. Delhi"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-accreditation">
                    Accreditation{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="create-accreditation"
                    value={createForm.accreditation}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        accreditation: e.target.value,
                      }))
                    }
                    placeholder="e.g. NAAC A+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-logo">
                    Logo URL{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="create-logo"
                    value={createForm.logo_url}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        logo_url: e.target.value,
                      }))
                    }
                    placeholder="https://..."
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
                <Button
                  type="submit"
                  disabled={
                    !createForm.university_type_id ||
                    !createForm.name ||
                    !createForm.slug
                  }
                >
                  Create University
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingUniversity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Edit University</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleUpdate}>
              <CardContent className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">University Type</Label>
                  <Select
                    value={editForm.university_type_id}
                    onValueChange={(v: string) =>
                      setEditForm((prev) => ({
                        ...prev,
                        university_type_id: v,
                      }))
                    }
                  >
                    <SelectTrigger id="edit-type">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {universityTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name ?? ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Delhi University"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input
                    id="edit-slug"
                    value={editForm.slug ?? ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        slug: toSlug(e.target.value),
                      }))
                    }
                    placeholder="e.g. delhi-university"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">City</Label>
                    <Input
                      id="edit-city"
                      value={editForm.city ?? ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      placeholder="e.g. New Delhi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-state">State</Label>
                    <Input
                      id="edit-state"
                      value={editForm.state ?? ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      placeholder="e.g. Delhi"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-accreditation">
                    Accreditation{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="edit-accreditation"
                    value={editForm.accreditation ?? ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        accreditation: e.target.value,
                      }))
                    }
                    placeholder="e.g. NAAC A+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-logo">
                    Logo URL{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="edit-logo"
                    value={editForm.logo_url ?? ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        logo_url: e.target.value,
                      }))
                    }
                    placeholder="https://..."
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
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
