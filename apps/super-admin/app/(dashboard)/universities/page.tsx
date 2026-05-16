"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
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
  PlusCircle,
  MinusCircle,
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
import type {
  University,
  CreateUniversityInput,
  UpdateUniversityInput,
} from "@/lib/services/universities.service";
import {
  useUniversities,
  useCreateUniversity,
  useUpdateUniversity,
  useArchiveUniversity,
} from "@/hooks/use-universities";
import { useUniversityTypes } from "@/hooks/use-university-types";

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type CouncilForm = {
  description: string;
  members: string[];
};

type UniversityMetadataForm = {
  overview: {
    description: string;
    accolades: {
      image: string;
      description: string;
      subdescription: string;
    };
    university_details: {
      est_date: string;
      nature_of_university: string;
      type_of_university: string;
      district: string;
      state: string;
      pincode: string;
    };
    disciplineJson: string;
    videosJson: string;
  };
  governance: {
    academic_council: CouncilForm;
    management_council: CouncilForm;
    organizationalOrgaonagramJson: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asMembers(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

const EMPTY_METADATA_FORM: UniversityMetadataForm = {
  overview: {
    description: "",
    accolades: {
      image: "",
      description: "",
      subdescription: "",
    },
    university_details: {
      est_date: "",
      nature_of_university: "",
      type_of_university: "",
      district: "",
      state: "",
      pincode: "",
    },
    disciplineJson: "{}",
    videosJson: "{}",
  },
  governance: {
    academic_council: {
      description: "",
      members: [""],
    },
    management_council: {
      description: "",
      members: [""],
    },
    organizationalOrgaonagramJson: "{}",
  },
};

function toMetadataForm(
  metadata?: Record<string, unknown>,
): UniversityMetadataForm {
  if (!metadata) return EMPTY_METADATA_FORM;

  const overview = isRecord(metadata.overview) ? metadata.overview : {};
  const accolades = isRecord(overview.accolades) ? overview.accolades : {};
  const details = isRecord(overview.university_details)
    ? overview.university_details
    : {};
  const governance = isRecord(metadata.governance) ? metadata.governance : {};
  const academicCouncil = isRecord(governance.academic_council)
    ? governance.academic_council
    : {};
  const managementCouncil = isRecord(governance.management_council)
    ? governance.management_council
    : {};

  return {
    overview: {
      description: asString(overview.description),
      accolades: {
        image: asString(accolades.image),
        description: asString(accolades.description),
        subdescription: asString(accolades.subdescription),
      },
      university_details: {
        est_date: asString(details.est_date),
        nature_of_university: asString(details.nature_of_university),
        type_of_university: asString(details.type_of_university),
        district: asString(details.district),
        state: asString(details.state),
        pincode: asString(details.pincode),
      },
      disciplineJson: JSON.stringify(
        isRecord(overview.discipline) ? overview.discipline : {},
        null,
        2,
      ),
      videosJson: JSON.stringify(
        isRecord(overview.videos) ? overview.videos : {},
        null,
        2,
      ),
    },
    governance: {
      academic_council: {
        description: asString(academicCouncil.description),
        members: asMembers(academicCouncil.members).length
          ? asMembers(academicCouncil.members)
          : [""],
      },
      management_council: {
        description: asString(managementCouncil.description),
        members: asMembers(managementCouncil.members).length
          ? asMembers(managementCouncil.members)
          : [""],
      },
      organizationalOrgaonagramJson: JSON.stringify(
        isRecord(governance.organizationalOrgaonagram)
          ? governance.organizationalOrgaonagram
          : {},
        null,
        2,
      ),
    },
  };
}

function parseJsonObject(
  value: string,
  fieldName: string,
): Record<string, unknown> {
  if (!value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    if (!isRecord(parsed)) {
      throw new Error(`${fieldName} must be a JSON object`);
    }
    return parsed;
  } catch {
    throw new Error(`${fieldName} must be valid JSON object`);
  }
}

function buildStructuredMetadata(
  form: UniversityMetadataForm,
): Record<string, unknown> {
  return {
    overview: {
      description: form.overview.description,
      accolades: {
        image: form.overview.accolades.image,
        description: form.overview.accolades.description,
        subdescription: form.overview.accolades.subdescription,
      },
      university_details: {
        est_date: form.overview.university_details.est_date,
        nature_of_university:
          form.overview.university_details.nature_of_university,
        type_of_university: form.overview.university_details.type_of_university,
        district: form.overview.university_details.district,
        state: form.overview.university_details.state,
        pincode: form.overview.university_details.pincode,
      },
      discipline: parseJsonObject(
        form.overview.disciplineJson,
        "Discipline model",
      ),
      videos: parseJsonObject(form.overview.videosJson, "Videos"),
    },
    governance: {
      academic_council: {
        description: form.governance.academic_council.description,
        members: form.governance.academic_council.members.filter((m) =>
          m.trim(),
        ),
      },
      management_council: {
        description: form.governance.management_council.description,
        members: form.governance.management_council.members.filter((m) =>
          m.trim(),
        ),
      },
      organizationalOrgaonagram: parseJsonObject(
        form.governance.organizationalOrgaonagramJson,
        "Organizational organogram",
      ),
    },
  };
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
  metadata: {},
};

export default function UniversitiesPage() {
  const [search, setSearch] = useState("");

  const { data: universities = [], isLoading } = useUniversities();
  const { data: universityTypes = [] } = useUniversityTypes();
  const createMutation = useCreateUniversity();
  const updateMutation = useUpdateUniversity();
  const archiveMutation = useArchiveUniversity();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(
    null,
  );
  const [createForm, setCreateForm] =
    useState<CreateUniversityInput>(EMPTY_CREATE_FORM);
  const [editForm, setEditForm] = useState<UpdateUniversityInput>({});
  const [createMetadataForm, setCreateMetadataForm] =
    useState<UniversityMetadataForm>(EMPTY_METADATA_FORM);
  const [editMetadataForm, setEditMetadataForm] =
    useState<UniversityMetadataForm>(EMPTY_METADATA_FORM);

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    let metadata: Record<string, unknown>;
    try {
      metadata = buildStructuredMetadata(createMetadataForm);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid metadata");
      return;
    }
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
      metadata,
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("University created successfully");
        setIsCreateModalOpen(false);
        setCreateForm(EMPTY_CREATE_FORM);
        setCreateMetadataForm(EMPTY_METADATA_FORM);
      },
    });
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
    setEditMetadataForm(toMetadataForm(university.metadata));
    setIsEditModalOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUniversity) return;
    let metadata: Record<string, unknown>;
    try {
      metadata = buildStructuredMetadata(editMetadataForm);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid metadata");
      return;
    }
    const payload: UpdateUniversityInput = {
      ...editForm,
      metadata,
    };
    updateMutation.mutate(
      { id: editingUniversity.id, data: payload },
      {
        onSuccess: () => {
          toast.success("University updated successfully");
          setIsEditModalOpen(false);
          setEditingUniversity(null);
          setEditMetadataForm(EMPTY_METADATA_FORM);
        },
      },
    );
  };

  const addCreateCouncilMember = (
    council: "academic_council" | "management_council",
  ) => {
    setCreateMetadataForm((prev) => ({
      ...prev,
      governance: {
        ...prev.governance,
        [council]: {
          ...prev.governance[council],
          members: [...prev.governance[council].members, ""],
        },
      },
    }));
  };

  const updateCreateCouncilMember = (
    council: "academic_council" | "management_council",
    index: number,
    value: string,
  ) => {
    setCreateMetadataForm((prev) => ({
      ...prev,
      governance: {
        ...prev.governance,
        [council]: {
          ...prev.governance[council],
          members: prev.governance[council].members.map((member, i) =>
            i === index ? value : member,
          ),
        },
      },
    }));
  };

  const removeCreateCouncilMember = (
    council: "academic_council" | "management_council",
    index: number,
  ) => {
    setCreateMetadataForm((prev) => ({
      ...prev,
      governance: {
        ...prev.governance,
        [council]: {
          ...prev.governance[council],
          members: prev.governance[council].members.filter(
            (_, i) => i !== index,
          ),
        },
      },
    }));
  };

  const addEditCouncilMember = (
    council: "academic_council" | "management_council",
  ) => {
    setEditMetadataForm((prev) => ({
      ...prev,
      governance: {
        ...prev.governance,
        [council]: {
          ...prev.governance[council],
          members: [...prev.governance[council].members, ""],
        },
      },
    }));
  };

  const updateEditCouncilMember = (
    council: "academic_council" | "management_council",
    index: number,
    value: string,
  ) => {
    setEditMetadataForm((prev) => ({
      ...prev,
      governance: {
        ...prev.governance,
        [council]: {
          ...prev.governance[council],
          members: prev.governance[council].members.map((member, i) =>
            i === index ? value : member,
          ),
        },
      },
    }));
  };

  const removeEditCouncilMember = (
    council: "academic_council" | "management_council",
    index: number,
  ) => {
    setEditMetadataForm((prev) => ({
      ...prev,
      governance: {
        ...prev.governance,
        [council]: {
          ...prev.governance[council],
          members: prev.governance[council].members.filter(
            (_, i) => i !== index,
          ),
        },
      },
    }));
  };

  const handleArchive = (id: string) => {
    if (
      !confirm(
        "Archive this university? It will no longer be visible publicly.",
      )
    )
      return;
    archiveMutation.mutate(id, {
      onSuccess: () => toast.success("University archived"),
    });
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

                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Metadata: Overview
                  </Label>
                  <div className="space-y-2">
                    <Label htmlFor="create-overview-description">
                      Description
                    </Label>
                    <Input
                      id="create-overview-description"
                      value={createMetadataForm.overview.description}
                      onChange={(e) =>
                        setCreateMetadataForm((prev) => ({
                          ...prev,
                          overview: {
                            ...prev.overview,
                            description: e.target.value,
                          },
                        }))
                      }
                      placeholder="Overview description"
                    />
                  </div>

                  <div className="rounded-md border p-4 space-y-3">
                    <Label className="text-sm font-medium">Accolades</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <Input
                        value={createMetadataForm.overview.accolades.image}
                        onChange={(e) =>
                          setCreateMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              accolades: {
                                ...prev.overview.accolades,
                                image: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Accolades image URL"
                      />
                      <Input
                        value={
                          createMetadataForm.overview.accolades.description
                        }
                        onChange={(e) =>
                          setCreateMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              accolades: {
                                ...prev.overview.accolades,
                                description: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Accolades description"
                      />
                      <Input
                        value={
                          createMetadataForm.overview.accolades.subdescription
                        }
                        onChange={(e) =>
                          setCreateMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              accolades: {
                                ...prev.overview.accolades,
                                subdescription: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Accolades subdescription"
                      />
                    </div>
                  </div>

                  <div className="rounded-md border p-4 space-y-3">
                    <Label className="text-sm font-medium">
                      University Details
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={
                          createMetadataForm.overview.university_details
                            .est_date
                        }
                        onChange={(e) =>
                          setCreateMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                est_date: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Established date"
                      />
                      <Input
                        value={
                          createMetadataForm.overview.university_details
                            .nature_of_university
                        }
                        onChange={(e) =>
                          setCreateMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                nature_of_university: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Nature of university"
                      />
                      <Input
                        value={
                          createMetadataForm.overview.university_details
                            .type_of_university
                        }
                        onChange={(e) =>
                          setCreateMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                type_of_university: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Type of university"
                      />
                      <Input
                        value={
                          createMetadataForm.overview.university_details
                            .district
                        }
                        onChange={(e) =>
                          setCreateMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                district: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="District"
                      />
                      <Input
                        value={
                          createMetadataForm.overview.university_details.state
                        }
                        onChange={(e) =>
                          setCreateMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                state: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="State"
                      />
                      <Input
                        value={
                          createMetadataForm.overview.university_details.pincode
                        }
                        onChange={(e) =>
                          setCreateMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                pincode: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Pincode"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-discipline-json">
                      Discipline JSON
                    </Label>
                    <textarea
                      id="create-discipline-json"
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={createMetadataForm.overview.disciplineJson}
                      onChange={(e) =>
                        setCreateMetadataForm((prev) => ({
                          ...prev,
                          overview: {
                            ...prev.overview,
                            disciplineJson: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-videos-json">Videos JSON</Label>
                    <textarea
                      id="create-videos-json"
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={createMetadataForm.overview.videosJson}
                      onChange={(e) =>
                        setCreateMetadataForm((prev) => ({
                          ...prev,
                          overview: {
                            ...prev.overview,
                            videosJson: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <Label className="text-base font-semibold">
                    Metadata: Governance
                  </Label>

                  <div className="rounded-md border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Academic Council
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          addCreateCouncilMember("academic_council")
                        }
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> Add member
                      </Button>
                    </div>
                    <Input
                      value={
                        createMetadataForm.governance.academic_council
                          .description
                      }
                      onChange={(e) =>
                        setCreateMetadataForm((prev) => ({
                          ...prev,
                          governance: {
                            ...prev.governance,
                            academic_council: {
                              ...prev.governance.academic_council,
                              description: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="Academic council description"
                    />
                    <div className="space-y-2">
                      {createMetadataForm.governance.academic_council.members.map(
                        (member, index) => (
                          <div
                            key={`create-academic-${index}`}
                            className="flex gap-2"
                          >
                            <Input
                              value={member}
                              onChange={(e) =>
                                updateCreateCouncilMember(
                                  "academic_council",
                                  index,
                                  e.target.value,
                                )
                              }
                              placeholder={`Member ${index + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={
                                createMetadataForm.governance.academic_council
                                  .members.length === 1
                              }
                              onClick={() =>
                                removeCreateCouncilMember(
                                  "academic_council",
                                  index,
                                )
                              }
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="rounded-md border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Management Council
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          addCreateCouncilMember("management_council")
                        }
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> Add member
                      </Button>
                    </div>
                    <Input
                      value={
                        createMetadataForm.governance.management_council
                          .description
                      }
                      onChange={(e) =>
                        setCreateMetadataForm((prev) => ({
                          ...prev,
                          governance: {
                            ...prev.governance,
                            management_council: {
                              ...prev.governance.management_council,
                              description: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="Management council description"
                    />
                    <div className="space-y-2">
                      {createMetadataForm.governance.management_council.members.map(
                        (member, index) => (
                          <div
                            key={`create-management-${index}`}
                            className="flex gap-2"
                          >
                            <Input
                              value={member}
                              onChange={(e) =>
                                updateCreateCouncilMember(
                                  "management_council",
                                  index,
                                  e.target.value,
                                )
                              }
                              placeholder={`Member ${index + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={
                                createMetadataForm.governance.management_council
                                  .members.length === 1
                              }
                              onClick={() =>
                                removeCreateCouncilMember(
                                  "management_council",
                                  index,
                                )
                              }
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-organogram-json">
                      Organizational Organogram JSON
                    </Label>
                    <textarea
                      id="create-organogram-json"
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={
                        createMetadataForm.governance
                          .organizationalOrgaonagramJson
                      }
                      onChange={(e) =>
                        setCreateMetadataForm((prev) => ({
                          ...prev,
                          governance: {
                            ...prev.governance,
                            organizationalOrgaonagramJson: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
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
                    !createForm.slug ||
                    createMutation.isPending
                  }
                >
                  {createMutation.isPending
                    ? "Creating..."
                    : "Create University"}
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

                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Metadata: Overview
                  </Label>
                  <div className="space-y-2">
                    <Label htmlFor="edit-overview-description">
                      Description
                    </Label>
                    <Input
                      id="edit-overview-description"
                      value={editMetadataForm.overview.description}
                      onChange={(e) =>
                        setEditMetadataForm((prev) => ({
                          ...prev,
                          overview: {
                            ...prev.overview,
                            description: e.target.value,
                          },
                        }))
                      }
                      placeholder="Overview description"
                    />
                  </div>

                  <div className="rounded-md border p-4 space-y-3">
                    <Label className="text-sm font-medium">Accolades</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <Input
                        value={editMetadataForm.overview.accolades.image}
                        onChange={(e) =>
                          setEditMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              accolades: {
                                ...prev.overview.accolades,
                                image: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Accolades image URL"
                      />
                      <Input
                        value={editMetadataForm.overview.accolades.description}
                        onChange={(e) =>
                          setEditMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              accolades: {
                                ...prev.overview.accolades,
                                description: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Accolades description"
                      />
                      <Input
                        value={
                          editMetadataForm.overview.accolades.subdescription
                        }
                        onChange={(e) =>
                          setEditMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              accolades: {
                                ...prev.overview.accolades,
                                subdescription: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Accolades subdescription"
                      />
                    </div>
                  </div>

                  <div className="rounded-md border p-4 space-y-3">
                    <Label className="text-sm font-medium">
                      University Details
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={
                          editMetadataForm.overview.university_details.est_date
                        }
                        onChange={(e) =>
                          setEditMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                est_date: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Established date"
                      />
                      <Input
                        value={
                          editMetadataForm.overview.university_details
                            .nature_of_university
                        }
                        onChange={(e) =>
                          setEditMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                nature_of_university: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Nature of university"
                      />
                      <Input
                        value={
                          editMetadataForm.overview.university_details
                            .type_of_university
                        }
                        onChange={(e) =>
                          setEditMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                type_of_university: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Type of university"
                      />
                      <Input
                        value={
                          editMetadataForm.overview.university_details.district
                        }
                        onChange={(e) =>
                          setEditMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                district: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="District"
                      />
                      <Input
                        value={
                          editMetadataForm.overview.university_details.state
                        }
                        onChange={(e) =>
                          setEditMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                state: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="State"
                      />
                      <Input
                        value={
                          editMetadataForm.overview.university_details.pincode
                        }
                        onChange={(e) =>
                          setEditMetadataForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                pincode: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Pincode"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-discipline-json">
                      Discipline JSON
                    </Label>
                    <textarea
                      id="edit-discipline-json"
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editMetadataForm.overview.disciplineJson}
                      onChange={(e) =>
                        setEditMetadataForm((prev) => ({
                          ...prev,
                          overview: {
                            ...prev.overview,
                            disciplineJson: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-videos-json">Videos JSON</Label>
                    <textarea
                      id="edit-videos-json"
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editMetadataForm.overview.videosJson}
                      onChange={(e) =>
                        setEditMetadataForm((prev) => ({
                          ...prev,
                          overview: {
                            ...prev.overview,
                            videosJson: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <Label className="text-base font-semibold">
                    Metadata: Governance
                  </Label>

                  <div className="rounded-md border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Academic Council
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => addEditCouncilMember("academic_council")}
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> Add member
                      </Button>
                    </div>
                    <Input
                      value={
                        editMetadataForm.governance.academic_council.description
                      }
                      onChange={(e) =>
                        setEditMetadataForm((prev) => ({
                          ...prev,
                          governance: {
                            ...prev.governance,
                            academic_council: {
                              ...prev.governance.academic_council,
                              description: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="Academic council description"
                    />
                    <div className="space-y-2">
                      {editMetadataForm.governance.academic_council.members.map(
                        (member, index) => (
                          <div
                            key={`edit-academic-${index}`}
                            className="flex gap-2"
                          >
                            <Input
                              value={member}
                              onChange={(e) =>
                                updateEditCouncilMember(
                                  "academic_council",
                                  index,
                                  e.target.value,
                                )
                              }
                              placeholder={`Member ${index + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={
                                editMetadataForm.governance.academic_council
                                  .members.length === 1
                              }
                              onClick={() =>
                                removeEditCouncilMember(
                                  "academic_council",
                                  index,
                                )
                              }
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="rounded-md border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Management Council
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          addEditCouncilMember("management_council")
                        }
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> Add member
                      </Button>
                    </div>
                    <Input
                      value={
                        editMetadataForm.governance.management_council
                          .description
                      }
                      onChange={(e) =>
                        setEditMetadataForm((prev) => ({
                          ...prev,
                          governance: {
                            ...prev.governance,
                            management_council: {
                              ...prev.governance.management_council,
                              description: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="Management council description"
                    />
                    <div className="space-y-2">
                      {editMetadataForm.governance.management_council.members.map(
                        (member, index) => (
                          <div
                            key={`edit-management-${index}`}
                            className="flex gap-2"
                          >
                            <Input
                              value={member}
                              onChange={(e) =>
                                updateEditCouncilMember(
                                  "management_council",
                                  index,
                                  e.target.value,
                                )
                              }
                              placeholder={`Member ${index + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={
                                editMetadataForm.governance.management_council
                                  .members.length === 1
                              }
                              onClick={() =>
                                removeEditCouncilMember(
                                  "management_council",
                                  index,
                                )
                              }
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-organogram-json">
                      Organizational Organogram JSON
                    </Label>
                    <textarea
                      id="edit-organogram-json"
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={
                        editMetadataForm.governance
                          .organizationalOrgaonagramJson
                      }
                      onChange={(e) =>
                        setEditMetadataForm((prev) => ({
                          ...prev,
                          governance: {
                            ...prev.governance,
                            organizationalOrgaonagramJson: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
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
