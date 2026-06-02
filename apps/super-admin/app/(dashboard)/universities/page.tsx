"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  GraduationCap,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Check,
  MapPin,
  Loader2,
  X,
  PlusCircle,
  MinusCircle,
  ToggleRight,
  ToggleLeft,
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
  useActivateUniversity,
  useDeactivateUniversity,
} from "@/hooks/use-universities";
import { useStreams } from "@/hooks/use-academic-taxonomy";
import { useUniversityTypes } from "@/hooks/use-university-types";

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type GovernanceMemberForm = {
  userPhotoUrl: string;
  name: string;
  designation: string;
  description: string;
};

type GovernanceCouncilForm = {
  description: string;
  members: GovernanceMemberForm[];
};

type UniversityGovernanceForm = {
  academic_council: GovernanceCouncilForm;
  management_council: GovernanceCouncilForm;
  organizational_organogram: {
    title: string;
    fileUrl: string;
    description: string;
  };
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
    disciplineStreamIds: string[];
    videosJson: string;
  };
};

function createEmptyGovernanceMember(): GovernanceMemberForm {
  return {
    userPhotoUrl: "",
    name: "",
    designation: "",
    description: "",
  };
}

function normalizeGovernanceMember(value: unknown): GovernanceMemberForm {
  if (typeof value === "string") {
    return {
      ...createEmptyGovernanceMember(),
      name: value,
    };
  }

  if (!isRecord(value)) {
    return createEmptyGovernanceMember();
  }

  return {
    userPhotoUrl: asString(value.userPhotoUrl),
    name: asString(value.name),
    designation: asString(value.designation),
    description: asString(value.description),
  };
}

function normalizeGovernanceCouncil(value: unknown): GovernanceCouncilForm {
  if (Array.isArray(value)) {
    const members = value.map(normalizeGovernanceMember);
    return {
      description: "",
      members: members.length ? members : [createEmptyGovernanceMember()],
    };
  }

  if (!isRecord(value)) {
    return {
      description: "",
      members: [createEmptyGovernanceMember()],
    };
  }

  const membersValue = Array.isArray(value.members)
    ? value.members
    : value.members
      ? [value.members]
      : [];
  const members = membersValue.map(normalizeGovernanceMember);

  return {
    description: asString(value.description),
    members: members.length ? members : [createEmptyGovernanceMember()],
  };
}

function normalizeOrganogram(value: unknown) {
  if (!isRecord(value)) {
    return {
      title: "",
      fileUrl: "",
      description: "",
    };
  }

  return {
    title: asString(value.title),
    fileUrl:
      asString(value.fileUrl) ||
      asString(value.imageUrl) ||
      asString(value.image),
    description: asString(value.description),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
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
    disciplineStreamIds: [],
    videosJson: "[]",
  },
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function extractDisciplineStreamIds(value: unknown): string[] {
  const ids = normalizeToArray(value)
    .map((item) => {
      if (typeof item === "string") {
        return isUuid(item) ? item : null;
      }

      if (!isRecord(item)) {
        return null;
      }

      const candidate =
        asString(item.id) ||
        asString(item.streamId) ||
        asString(item.stream_id);

      return isUuid(candidate) ? candidate : null;
    })
    .filter((id): id is string => Boolean(id));

  return Array.from(new Set(ids));
}

function normalizeToArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

const EMPTY_GOVERNANCE_FORM: UniversityGovernanceForm = {
  academic_council: {
    description: "",
    members: [createEmptyGovernanceMember()],
  },
  management_council: {
    description: "",
    members: [createEmptyGovernanceMember()],
  },
  organizational_organogram: {
    title: "",
    fileUrl: "",
    description: "",
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
      disciplineStreamIds: extractDisciplineStreamIds(overview.discipline),
      videosJson: JSON.stringify(normalizeToArray(overview.videos), null, 2),
    },
  };
}

function toGovernanceForm(
  metadata?: Record<string, unknown>,
): UniversityGovernanceForm {
  if (!metadata) return EMPTY_GOVERNANCE_FORM;

  const governance = isRecord(metadata.governance) ? metadata.governance : {};
  const academicCouncil = normalizeGovernanceCouncil(
    governance.academic_council,
  );
  const managementCouncil = normalizeGovernanceCouncil(
    governance.management_council,
  );
  const organogramSource = isRecord(governance.organizational_organogram)
    ? governance.organizational_organogram
    : isRecord(governance.organizationalOrgaonagram)
      ? governance.organizationalOrgaonagram
      : {};

  return {
    academic_council: academicCouncil,
    management_council: managementCouncil,
    organizational_organogram: normalizeOrganogram(organogramSource),
  };
}

function parseJsonArray(value: string, fieldName: string): unknown[] {
  if (!value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return normalizeToArray(parsed);
  } catch {
    throw new Error(`${fieldName} must be valid JSON array`);
  }
}

function buildStructuredMetadata(
  form: UniversityMetadataForm,
  availableStreams: Array<{ id: string; name: string; slug: string }>,
): Record<string, unknown> {
  const selectedStreamMap = new Map(
    availableStreams.map((stream) => [stream.id, stream] as const),
  );

  const selectedStreams = form.overview.disciplineStreamIds
    .map((streamId) => selectedStreamMap.get(streamId))
    .filter(
      (
        stream,
      ): stream is {
        id: string;
        name: string;
        slug: string;
      } => Boolean(stream),
    )
    .map((stream) => ({
      id: stream.id,
      name: stream.name,
      slug: stream.slug,
    }));

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
      discipline: selectedStreams,
      videos: parseJsonArray(form.overview.videosJson, "Videos"),
    },
  };
}

function buildStructuredGovernance(
  form: UniversityGovernanceForm,
): NonNullable<CreateUniversityInput["governance"]> {
  return {
    academic_council: form.academic_council.members.filter(
      (member) =>
        member.userPhotoUrl.trim() ||
        member.name.trim() ||
        member.designation.trim() ||
        member.description.trim(),
    ),
    management_council: form.management_council.members.filter(
      (member) =>
        member.userPhotoUrl.trim() ||
        member.name.trim() ||
        member.designation.trim() ||
        member.description.trim(),
    ),
    organizational_organogram: {
      title: form.organizational_organogram.title,
      fileUrl: form.organizational_organogram.fileUrl,
      description: form.organizational_organogram.description,
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
  cover_url: "",
  governance_details: "",
  logo_url: "",
  metadata: {},
};

export default function UniversitiesPage() {
  const [search, setSearch] = useState("");

  const { data: universities = [], isLoading } = useUniversities();
  const { data: universityTypes = [] } = useUniversityTypes();
  const { data: streams = [] } = useStreams(true);
  const createMutation = useCreateUniversity();
  const updateMutation = useUpdateUniversity();
  const activateMutation = useActivateUniversity();
  const deactivateMutation = useDeactivateUniversity();

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
  const [createGovernanceForm, setCreateGovernanceForm] =
    useState<UniversityGovernanceForm>(EMPTY_GOVERNANCE_FORM);
  const [editMetadataForm, setEditMetadataForm] =
    useState<UniversityMetadataForm>(EMPTY_METADATA_FORM);
  const [editGovernanceForm, setEditGovernanceForm] =
    useState<UniversityGovernanceForm>(EMPTY_GOVERNANCE_FORM);
  const [createMetadataTab, setCreateMetadataTab] = useState<
    "overview" | "governance"
  >("overview");
  const [editMetadataTab, setEditMetadataTab] = useState<
    "overview" | "governance"
  >("overview");

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

  const activeStreams = useMemo(
    () =>
      streams
        .filter((stream) => stream.isActive)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [streams],
  );

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
      metadata = buildStructuredMetadata(createMetadataForm, activeStreams);
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
      ...(createForm.cover_url ? { cover_url: createForm.cover_url } : {}),
      ...(createForm.governance_details
        ? { governance_details: createForm.governance_details }
        : {}),
      ...(createForm.logo_url ? { logo_url: createForm.logo_url } : {}),
      metadata,
      governance: buildStructuredGovernance(createGovernanceForm),
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("University created successfully");
        setIsCreateModalOpen(false);
        setCreateForm(EMPTY_CREATE_FORM);
        setCreateMetadataForm(EMPTY_METADATA_FORM);
        setCreateGovernanceForm(EMPTY_GOVERNANCE_FORM);
      },
    });
  };

  const handleEditClick = (university: University) => {
    const metadata = university.metadata;
    setEditingUniversity(university);
    setEditForm({
      university_type_id: university.universityType.id,
      name: university.name,
      slug: university.slug,
      state: university.state ?? "",
      city: university.city ?? "",
      accreditation: university.accreditation ?? "",
      cover_url: asString(metadata?.cover_url),
      governance_details: university.governanceDetails ?? "",
      logo_url: university.logoUrl ?? "",
    });
    setEditMetadataForm(toMetadataForm(metadata));
    setEditGovernanceForm(toGovernanceForm(metadata));
    setEditMetadataTab("overview");
    setIsEditModalOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUniversity) return;
    let metadata: Record<string, unknown>;
    try {
      metadata = buildStructuredMetadata(editMetadataForm, activeStreams);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid metadata");
      return;
    }
    const payload: UpdateUniversityInput = {
      ...editForm,
      metadata,
      governance: buildStructuredGovernance(editGovernanceForm),
    };
    updateMutation.mutate(
      { id: editingUniversity.id, data: payload },
      {
        onSuccess: () => {
          toast.success("University updated successfully");
          setIsEditModalOpen(false);
          setEditingUniversity(null);
          setEditMetadataForm(EMPTY_METADATA_FORM);
          setEditGovernanceForm(EMPTY_GOVERNANCE_FORM);
        },
      },
    );
  };

  const addCreateCouncilMember = (
    council: "academic_council" | "management_council",
  ) => {
    setCreateGovernanceForm((prev) => ({
      ...prev,
      [council]: {
        ...prev[council],
        members: [...prev[council].members, createEmptyGovernanceMember()],
      },
    }));
  };

  const updateCreateCouncilMember = (
    council: "academic_council" | "management_council",
    index: number,
    field: keyof GovernanceMemberForm,
    value: string,
  ) => {
    setCreateGovernanceForm((prev) => ({
      ...prev,
      [council]: {
        ...prev[council],
        members: prev[council].members.map((member, i) =>
          i === index ? { ...member, [field]: value } : member,
        ),
      },
    }));
  };

  const removeCreateCouncilMember = (
    council: "academic_council" | "management_council",
    index: number,
  ) => {
    setCreateGovernanceForm((prev) => ({
      ...prev,
      [council]: {
        ...prev[council],
        members: prev[council].members.filter((_, i) => i !== index),
      },
    }));
  };

  const addEditCouncilMember = (
    council: "academic_council" | "management_council",
  ) => {
    setEditGovernanceForm((prev) => ({
      ...prev,
      [council]: {
        ...prev[council],
        members: [...prev[council].members, createEmptyGovernanceMember()],
      },
    }));
  };

  const updateEditCouncilMember = (
    council: "academic_council" | "management_council",
    index: number,
    field: keyof GovernanceMemberForm,
    value: string,
  ) => {
    setEditGovernanceForm((prev) => ({
      ...prev,
      [council]: {
        ...prev[council],
        members: prev[council].members.map((member, i) =>
          i === index ? { ...member, [field]: value } : member,
        ),
      },
    }));
  };

  const removeEditCouncilMember = (
    council: "academic_council" | "management_council",
    index: number,
  ) => {
    setEditGovernanceForm((prev) => ({
      ...prev,
      [council]: {
        ...prev[council],
        members: prev[council].members.filter((_, i) => i !== index),
      },
    }));
  };

  const toggleCreateDisciplineStream = (streamId: string) => {
    setCreateMetadataForm((prev) => {
      const alreadySelected =
        prev.overview.disciplineStreamIds.includes(streamId);
      return {
        ...prev,
        overview: {
          ...prev.overview,
          disciplineStreamIds: alreadySelected
            ? prev.overview.disciplineStreamIds.filter((id) => id !== streamId)
            : [...prev.overview.disciplineStreamIds, streamId],
        },
      };
    });
  };

  const toggleEditDisciplineStream = (streamId: string) => {
    setEditMetadataForm((prev) => {
      const alreadySelected =
        prev.overview.disciplineStreamIds.includes(streamId);
      return {
        ...prev,
        overview: {
          ...prev.overview,
          disciplineStreamIds: alreadySelected
            ? prev.overview.disciplineStreamIds.filter((id) => id !== streamId)
            : [...prev.overview.disciplineStreamIds, streamId],
        },
      };
    });
  };

  const handleActivate = (id: string) => {
    activateMutation.mutate(id, {
      onSuccess: () => toast.success("University set to active"),
    });
  };

  const handleDeactivate = (id: string) => {
    deactivateMutation.mutate(id, {
      onSuccess: () => toast.success("University set to inactive"),
    });
  };

  return (
    <div className="flex flex-col min-h-full relative">
      <Header
        title="Universities"
        description="Manage university groups and their affiliated colleges"
      >
        <Button
          className="gap-2"
          onClick={() => {
            setCreateMetadataTab("overview");
            setIsCreateModalOpen(true);
          }}
        >
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
                              {university.status !== "active" && (
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleActivate(university.id)}
                                >
                                  <ToggleRight className="h-4 w-4 text-muted-foreground" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {university.status !== "inactive" && (
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() =>
                                    handleDeactivate(university.id)
                                  }
                                >
                                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                  Deactivate
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
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border-0 overflow-hidden">
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">
                      Add University
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Fill in the details to create a new university
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
                  <Label htmlFor="create-cover">
                    Cover URL{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="create-cover"
                    value={createForm.cover_url ?? ""}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        cover_url: e.target.value,
                      }))
                    }
                    placeholder="https://..."
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

                <div className="flex gap-2 rounded-lg bg-muted/60 p-1">
                  <Button
                    type="button"
                    variant={
                      createMetadataTab === "overview" ? "default" : "ghost"
                    }
                    size="sm"
                    className="flex-1"
                    onClick={() => setCreateMetadataTab("overview")}
                  >
                    Overview
                  </Button>
                  <Button
                    type="button"
                    variant={
                      createMetadataTab === "governance" ? "default" : "ghost"
                    }
                    size="sm"
                    className="flex-1"
                    onClick={() => setCreateMetadataTab("governance")}
                  >
                    Governance
                  </Button>
                </div>

                <div
                  className={
                    createMetadataTab === "overview" ? "space-y-3" : "hidden"
                  }
                >
                  <Label className="text-base font-semibold">Overview</Label>
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
                    <Label>Disciple (Streams)</Label>
                    <div className="space-y-2 rounded-md border border-input bg-background p-3">
                      <p className="text-xs text-muted-foreground">
                        Select one or more streams for this university.
                      </p>
                      {activeStreams.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No active streams found.
                        </p>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2">
                          {activeStreams.map((stream) => {
                            const isSelected =
                              createMetadataForm.overview.disciplineStreamIds.includes(
                                stream.id,
                              );
                            return (
                              <button
                                key={stream.id}
                                type="button"
                                onClick={() =>
                                  toggleCreateDisciplineStream(stream.id)
                                }
                                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-input hover:bg-muted/40"
                                }`}
                              >
                                <span
                                  className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                                    isSelected
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-muted-foreground/40"
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3" />}
                                </span>
                                <span>{stream.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-videos-json">
                      Videos JSON (Array)
                    </Label>
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
                      placeholder='[{"title":"Campus Tour","url":"https://..."}]'
                    />
                  </div>
                </div>

                <div
                  className={
                    createMetadataTab === "governance" ? "space-y-3" : "hidden"
                  }
                >
                  <Label className="text-base font-semibold">Governance</Label>

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
                      value={createGovernanceForm.academic_council.description}
                      onChange={(e) =>
                        setCreateGovernanceForm((prev) => ({
                          ...prev,
                          academic_council: {
                            ...prev.academic_council,
                            description: e.target.value,
                          },
                        }))
                      }
                      placeholder="Academic council description"
                    />
                    <div className="space-y-2">
                      {createGovernanceForm.academic_council.members.map(
                        (member, index) => (
                          <div
                            key={`create-academic-${index}`}
                            className="grid gap-2 md:grid-cols-2 xl:grid-cols-5"
                          >
                            <Input
                              value={member.userPhotoUrl}
                              onChange={(e) =>
                                updateCreateCouncilMember(
                                  "academic_council",
                                  index,
                                  "userPhotoUrl",
                                  e.target.value,
                                )
                              }
                              placeholder="User photo URL"
                            />
                            <Input
                              value={member.name}
                              onChange={(e) =>
                                updateCreateCouncilMember(
                                  "academic_council",
                                  index,
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder={`Member ${index + 1} name`}
                            />
                            <Input
                              value={member.designation}
                              onChange={(e) =>
                                updateCreateCouncilMember(
                                  "academic_council",
                                  index,
                                  "designation",
                                  e.target.value,
                                )
                              }
                              placeholder="Designation"
                            />
                            <Input
                              value={member.description}
                              onChange={(e) =>
                                updateCreateCouncilMember(
                                  "academic_council",
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Description"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="justify-self-start"
                              disabled={
                                createGovernanceForm.academic_council.members
                                  .length === 1
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
                        createGovernanceForm.management_council.description
                      }
                      onChange={(e) =>
                        setCreateGovernanceForm((prev) => ({
                          ...prev,
                          management_council: {
                            ...prev.management_council,
                            description: e.target.value,
                          },
                        }))
                      }
                      placeholder="Management council description"
                    />
                    <div className="space-y-2">
                      {createGovernanceForm.management_council.members.map(
                        (member, index) => (
                          <div
                            key={`create-management-${index}`}
                            className="grid gap-2 md:grid-cols-2 xl:grid-cols-5"
                          >
                            <Input
                              value={member.userPhotoUrl}
                              onChange={(e) =>
                                updateCreateCouncilMember(
                                  "management_council",
                                  index,
                                  "userPhotoUrl",
                                  e.target.value,
                                )
                              }
                              placeholder="User photo URL"
                            />
                            <Input
                              value={member.name}
                              onChange={(e) =>
                                updateCreateCouncilMember(
                                  "management_council",
                                  index,
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder={`Member ${index + 1} name`}
                            />
                            <Input
                              value={member.designation}
                              onChange={(e) =>
                                updateCreateCouncilMember(
                                  "management_council",
                                  index,
                                  "designation",
                                  e.target.value,
                                )
                              }
                              placeholder="Designation"
                            />
                            <Input
                              value={member.description}
                              onChange={(e) =>
                                updateCreateCouncilMember(
                                  "management_council",
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Description"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="justify-self-start"
                              disabled={
                                createGovernanceForm.management_council.members
                                  .length === 1
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

                  <div className="rounded-md border p-4 space-y-3">
                    <Label className="text-sm font-medium">
                      Organizational Organogram
                    </Label>
                    <Input
                      value={
                        createGovernanceForm.organizational_organogram.title
                      }
                      onChange={(e) =>
                        setCreateGovernanceForm((prev) => ({
                          ...prev,
                          organizational_organogram: {
                            ...prev.organizational_organogram,
                            title: e.target.value,
                          },
                        }))
                      }
                      placeholder="Title"
                    />

                    <Input
                      value={
                        createGovernanceForm.organizational_organogram.fileUrl
                      }
                      onChange={(e) =>
                        setCreateGovernanceForm((prev) => ({
                          ...prev,
                          organizational_organogram: {
                            ...prev.organizational_organogram,
                            fileUrl: e.target.value,
                          },
                        }))
                      }
                      placeholder="File URL (PDF)"
                    />
                    <Input
                      value={
                        createGovernanceForm.organizational_organogram
                          .description
                      }
                      onChange={(e) =>
                        setCreateGovernanceForm((prev) => ({
                          ...prev,
                          organizational_organogram: {
                            ...prev.organizational_organogram,
                            description: e.target.value,
                          },
                        }))
                      }
                      placeholder="Description"
                    />
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 p-4 border-t bg-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-[140px]"
                  disabled={
                    !createForm.university_type_id ||
                    !createForm.name ||
                    !createForm.slug ||
                    createMutation.isPending
                  }
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create University"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingUniversity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border-0 overflow-hidden">
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
                    <Edit className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">
                      Edit University
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Update university information and metadata
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
                  <Label htmlFor="edit-cover">
                    Cover URL{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="edit-cover"
                    value={editForm.cover_url ?? ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        cover_url: e.target.value,
                      }))
                    }
                    placeholder="https://..."
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

                <div className="flex gap-2 rounded-lg bg-muted/60 p-1">
                  <Button
                    type="button"
                    variant={
                      editMetadataTab === "overview" ? "default" : "ghost"
                    }
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditMetadataTab("overview")}
                  >
                    Overview
                  </Button>
                  <Button
                    type="button"
                    variant={
                      editMetadataTab === "governance" ? "default" : "ghost"
                    }
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditMetadataTab("governance")}
                  >
                    Governance
                  </Button>
                </div>

                <div
                  className={
                    editMetadataTab === "overview" ? "space-y-3" : "hidden"
                  }
                >
                  <Label className="text-base font-semibold">Overview</Label>
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
                    <Label>Disciple (Streams)</Label>
                    <div className="space-y-2 rounded-md border border-input bg-background p-3">
                      <p className="text-xs text-muted-foreground">
                        Select one or more streams for this university.
                      </p>
                      {activeStreams.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No active streams found.
                        </p>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2">
                          {activeStreams.map((stream) => {
                            const isSelected =
                              editMetadataForm.overview.disciplineStreamIds.includes(
                                stream.id,
                              );
                            return (
                              <button
                                key={stream.id}
                                type="button"
                                onClick={() =>
                                  toggleEditDisciplineStream(stream.id)
                                }
                                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-input hover:bg-muted/40"
                                }`}
                              >
                                <span
                                  className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                                    isSelected
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-muted-foreground/40"
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3" />}
                                </span>
                                <span>{stream.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-videos-json">
                      Videos JSON (Array)
                    </Label>
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
                      placeholder='[{"title":"Campus Tour","url":"https://..."}]'
                    />
                  </div>
                </div>

                <div
                  className={
                    editMetadataTab === "governance" ? "space-y-3" : "hidden"
                  }
                >
                  <Label className="text-base font-semibold">Governance</Label>

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
                      value={editGovernanceForm.academic_council.description}
                      onChange={(e) =>
                        setEditGovernanceForm((prev) => ({
                          ...prev,
                          academic_council: {
                            ...prev.academic_council,
                            description: e.target.value,
                          },
                        }))
                      }
                      placeholder="Academic council description"
                    />
                    <div className="space-y-2">
                      {editGovernanceForm.academic_council.members.map(
                        (member, index) => (
                          <div
                            key={`edit-academic-${index}`}
                            className="grid gap-2 md:grid-cols-2 xl:grid-cols-5"
                          >
                            <Input
                              value={member.userPhotoUrl}
                              onChange={(e) =>
                                updateEditCouncilMember(
                                  "academic_council",
                                  index,
                                  "userPhotoUrl",
                                  e.target.value,
                                )
                              }
                              placeholder="User photo URL"
                            />
                            <Input
                              value={member.name}
                              onChange={(e) =>
                                updateEditCouncilMember(
                                  "academic_council",
                                  index,
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder={`Member ${index + 1} name`}
                            />
                            <Input
                              value={member.designation}
                              onChange={(e) =>
                                updateEditCouncilMember(
                                  "academic_council",
                                  index,
                                  "designation",
                                  e.target.value,
                                )
                              }
                              placeholder="Designation"
                            />
                            <Input
                              value={member.description}
                              onChange={(e) =>
                                updateEditCouncilMember(
                                  "academic_council",
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Description"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="justify-self-start"
                              disabled={
                                editGovernanceForm.academic_council.members
                                  .length === 1
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
                      value={editGovernanceForm.management_council.description}
                      onChange={(e) =>
                        setEditGovernanceForm((prev) => ({
                          ...prev,
                          management_council: {
                            ...prev.management_council,
                            description: e.target.value,
                          },
                        }))
                      }
                      placeholder="Management council description"
                    />
                    <div className="space-y-2">
                      {editGovernanceForm.management_council.members.map(
                        (member, index) => (
                          <div
                            key={`edit-management-${index}`}
                            className="grid gap-2 md:grid-cols-2 xl:grid-cols-5"
                          >
                            <Input
                              value={member.userPhotoUrl}
                              onChange={(e) =>
                                updateEditCouncilMember(
                                  "management_council",
                                  index,
                                  "userPhotoUrl",
                                  e.target.value,
                                )
                              }
                              placeholder="User photo URL"
                            />
                            <Input
                              value={member.name}
                              onChange={(e) =>
                                updateEditCouncilMember(
                                  "management_council",
                                  index,
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder={`Member ${index + 1} name`}
                            />
                            <Input
                              value={member.designation}
                              onChange={(e) =>
                                updateEditCouncilMember(
                                  "management_council",
                                  index,
                                  "designation",
                                  e.target.value,
                                )
                              }
                              placeholder="Designation"
                            />
                            <Input
                              value={member.description}
                              onChange={(e) =>
                                updateEditCouncilMember(
                                  "management_council",
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Description"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="justify-self-start"
                              disabled={
                                editGovernanceForm.management_council.members
                                  .length === 1
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

                  <div className="rounded-md border p-4 space-y-3">
                    <Label className="text-sm font-medium">
                      Organizational Organogram
                    </Label>
                    <Input
                      value={editGovernanceForm.organizational_organogram.title}
                      onChange={(e) =>
                        setEditGovernanceForm((prev) => ({
                          ...prev,
                          organizational_organogram: {
                            ...prev.organizational_organogram,
                            title: e.target.value,
                          },
                        }))
                      }
                      placeholder="Title"
                    />

                    <Input
                      value={
                        editGovernanceForm.organizational_organogram.fileUrl
                      }
                      onChange={(e) =>
                        setEditGovernanceForm((prev) => ({
                          ...prev,
                          organizational_organogram: {
                            ...prev.organizational_organogram,
                            fileUrl: e.target.value,
                          },
                        }))
                      }
                      placeholder="File URL (PDF)"
                    />
                    <Input
                      value={
                        editGovernanceForm.organizational_organogram.description
                      }
                      onChange={(e) =>
                        setEditGovernanceForm((prev) => ({
                          ...prev,
                          organizational_organogram: {
                            ...prev.organizational_organogram,
                            description: e.target.value,
                          },
                        }))
                      }
                      placeholder="Description"
                    />
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 p-4 border-t bg-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-[130px]"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
