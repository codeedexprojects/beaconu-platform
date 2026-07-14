"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import {
  Edit,
  Check,
  Loader2,
  PlusCircle,
  MinusCircle,
  ArrowLeft,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { ImageUpload } from "@/components/ui/image-upload";
import { FileUpload } from "@/components/ui/file-upload";
import { VideoListEditor } from "@/components/universities/video-list-editor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UpdateUniversityInput } from "@/lib/services/universities.service";
import { useUniversity, useUpdateUniversity } from "@/hooks/use-universities";
import { useAllActiveStreams } from "@/hooks/use-academic-taxonomy";
import {
  useUniversityType,
  useUniversityTypes,
} from "@/hooks/use-university-types";

// ── types ────────────────────────────────────────────────────────────────────
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

type UniversityAccoladeForm = {
  image: string;
  description: string;
  subdescription: string;
};

type UniversityMetadataForm = {
  overview: {
    description: string;
    accolades: UniversityAccoladeForm[];
    university_details: {
      est_date: string;
      nature_of_university: string;
      type_of_university: string;
      district: string;
      state: string;
      pincode: string;
      affiliated_colleges: string;
      autonomous_colleges: string;
    };
    streamIds: string[];
    videosJson: string;
  };
};

// ── helpers ──────────────────────────────────────────────────────────────────
function toSlug(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function toArr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : v == null ? [] : [v];
}
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(v: string) {
  return UUID_RE.test(v);
}
function emptyMember(): GovernanceMemberForm {
  return { userPhotoUrl: "", name: "", designation: "", description: "" };
}

function emptyAccolade(): UniversityAccoladeForm {
  return { image: "", description: "", subdescription: "" };
}

function isAccoladeComplete(accolade: UniversityAccoladeForm): boolean {
  return Boolean(
    accolade.image.trim() &&
    accolade.description.trim() &&
    accolade.subdescription.trim(),
  );
}

function isMemberComplete(member: GovernanceMemberForm): boolean {
  return Boolean(member.name.trim() && member.designation.trim());
}

function normalizeAccolades(v: unknown): UniversityAccoladeForm[] {
  const raw = Array.isArray(v) ? v : v == null ? [] : [v];
  const normalized = raw.map((item) => {
    if (!isRecord(item)) return emptyAccolade();
    return {
      image: asStr(item.image) || asStr(item.image_url),
      description: asStr(item.description),
      subdescription: asStr(item.subdescription),
    };
  });
  return normalized.length > 0 ? normalized : [emptyAccolade()];
}

function normMember(v: unknown): GovernanceMemberForm {
  if (typeof v === "string") return { ...emptyMember(), name: v };
  if (!isRecord(v)) return emptyMember();
  return {
    userPhotoUrl: asStr(v.userPhotoUrl),
    name: asStr(v.name),
    designation: asStr(v.designation),
    description: asStr(v.description),
  };
}
function normCouncil(v: unknown): GovernanceCouncilForm {
  if (Array.isArray(v)) {
    const m = v.map(normMember);
    return { description: "", members: m.length ? m : [emptyMember()] };
  }
  if (!isRecord(v)) return { description: "", members: [emptyMember()] };
  const raw = Array.isArray(v.members)
    ? v.members
    : v.members
      ? [v.members]
      : [];
  const m = raw.map(normMember);
  return {
    description: asStr(v.description),
    members: m.length ? m : [emptyMember()],
  };
}
function normOrganogram(v: unknown) {
  if (!isRecord(v)) return { title: "", fileUrl: "", description: "" };
  return {
    title: asStr(v.title),
    fileUrl: asStr(v.fileUrl) || asStr(v.imageUrl) || asStr(v.image),
    description: asStr(v.description),
  };
}
function extractStreamIds(v: unknown): string[] {
  return Array.from(
    new Set(
      toArr(v)
        .map((item) => {
          if (typeof item === "string") return item.trim() || null;
          if (!isRecord(item)) return null;
          const c =
            asStr(item.id) || asStr(item.streamId) || asStr(item.stream_id);
          return c.trim() || null;
        })
        .filter((x): x is string => Boolean(x)),
    ),
  );
}

function toMetadataForm(
  meta?: Record<string, unknown>,
): UniversityMetadataForm {
  const ov = isRecord(meta?.overview) ? meta!.overview : {};
  const det = isRecord((ov as Record<string, unknown>).university_details)
    ? ((ov as Record<string, unknown>).university_details as Record<
        string,
        unknown
      >)
    : {};
  return {
    overview: {
      description: asStr((ov as Record<string, unknown>).description),
      accolades: normalizeAccolades((ov as Record<string, unknown>).accolades),
      university_details: {
        est_date: asStr(det.est_date),
        nature_of_university: asStr(det.nature_of_university),
        type_of_university: asStr(det.type_of_university),
        district: asStr(det.district),
        state: asStr(det.state),
        pincode: asStr(det.pincode),
        affiliated_colleges: asStr(det.affiliated_colleges),
        autonomous_colleges: asStr(det.autonomous_colleges),
      },
      streamIds: extractStreamIds(
        (ov as Record<string, unknown>).streams ??
          (ov as Record<string, unknown>).discipline,
      ),
      videosJson: JSON.stringify(
        toArr((ov as Record<string, unknown>).videos),
        null,
        2,
      ),
    },
  };
}

function toGovernanceForm(
  meta?: Record<string, unknown>,
): UniversityGovernanceForm {
  const gov = isRecord(meta?.governance)
    ? (meta!.governance as Record<string, unknown>)
    : {};
  const organSrc = isRecord(gov.organizational_organogram)
    ? gov.organizational_organogram
    : isRecord(gov.organizationalOrgaonagram)
      ? gov.organizationalOrgaonagram
      : {};
  return {
    academic_council: normCouncil(gov.academic_council),
    management_council: normCouncil(gov.management_council),
    organizational_organogram: normOrganogram(organSrc),
  };
}

function buildMetadata(
  form: UniversityMetadataForm,
  streams: Array<{ id: string; name: string; slug: string }>,
) {
  const streamMap = new Map(streams.map((s) => [s.id, s]));
  const streamsPayload = form.overview.streamIds
    .map((id) => streamMap.get(id))
    .filter((s): s is { id: string; name: string; slug: string } => Boolean(s))
    .map((s) => ({ id: s.id, name: s.name, slug: s.slug }));
  let videos: unknown[];
  if (!form.overview.videosJson.trim()) {
    videos = [];
  } else {
    try {
      videos = toArr(JSON.parse(form.overview.videosJson));
    } catch {
      throw new Error("Videos must be valid JSON array");
    }
  }
  return {
    overview: {
      description: form.overview.description,
      accolades: form.overview.accolades
        .filter(isAccoladeComplete)
        .map((accolade) => ({
          image_url: accolade.image,
          description: accolade.description,
          subdescription: accolade.subdescription,
        })),
      university_details: form.overview.university_details,
      streams: streamsPayload,
      videos,
    },
  };
}

function buildGovernance(form: UniversityGovernanceForm) {
  const hasContent = (m: GovernanceMemberForm) =>
    m.userPhotoUrl.trim() ||
    m.name.trim() ||
    m.designation.trim() ||
    m.description.trim();
  return {
    academic_council: {
      description: form.academic_council.description,
      members: form.academic_council.members.filter(hasContent),
    },
    management_council: {
      description: form.management_council.description,
      members: form.management_council.members.filter(hasContent),
    },
    organizational_organogram: form.organizational_organogram,
  };
}

const EMPTY_META: UniversityMetadataForm = {
  overview: {
    description: "",
    accolades: [emptyAccolade()],
    university_details: {
      est_date: "",
      nature_of_university: "",
      type_of_university: "",
      district: "",
      state: "",
      pincode: "",
      affiliated_colleges: "",
      autonomous_colleges: "",
    },
    streamIds: [],
    videosJson: "[]",
  },
};
const EMPTY_GOV: UniversityGovernanceForm = {
  academic_council: { description: "", members: [emptyMember()] },
  management_council: { description: "", members: [emptyMember()] },
  organizational_organogram: { title: "", fileUrl: "", description: "" },
};

// ── page ─────────────────────────────────────────────────────────────────────
export default function EditUniversityPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: university, isLoading } = useUniversity(params.id);
  const { data: universityTypes = [] } = useUniversityTypes();
  const resolvedUniversityTypeId =
    university?.universityType?.id ?? university?.universityTypeId ?? "";
  const { data: currentUniversityType } = useUniversityType(
    resolvedUniversityTypeId,
  );
  const { data: streams = [] } = useAllActiveStreams();
  const updateMutation = useUpdateUniversity();

  const [form, setForm] = useState<UpdateUniversityInput>({});
  const [metaForm, setMetaForm] = useState<UniversityMetadataForm>(EMPTY_META);
  const [govForm, setGovForm] = useState<UniversityGovernanceForm>(EMPTY_GOV);
  const [activeTab, setActiveTab] = useState<"overview" | "governance">(
    "overview",
  );

  // Debug logging to diagnose type fetching
  useEffect(() => {
    console.log("🔍 University Type Debug Info:", {
      hasUniversity: !!university,
      universityTypeId: university?.universityTypeId,
      universityTypeRelation: university?.universityType,
      resolvedTypeId: resolvedUniversityTypeId,
      isFetching: !!resolvedUniversityTypeId && !currentUniversityType,
      currentUniversityType,
      universityTypesCount: universityTypes.length,
      formTypeId: form.university_type_id,
    });
  }, [
    university,
    currentUniversityType,
    universityTypes,
    resolvedUniversityTypeId,
    form.university_type_id,
  ]);

  useEffect(() => {
    if (!university) return;
    const meta = university.metadata;
    setForm({
      university_type_id:
        university.universityType?.id ?? university.universityTypeId ?? "",
      name: university.name,
      slug: university.slug,
      state: university.state ?? "",
      city: university.city ?? "",
      accreditation: university.accreditation ?? "",
      cover_url: asStr(meta?.cover_url),
      governance_details: university.governanceDetails ?? "",
      logo_url: university.logoUrl ?? "",
    });
    setMetaForm(toMetadataForm(meta));
    setGovForm(toGovernanceForm(meta));
  }, [university]);

  // Sync fetched university type back to form if not already set
  useEffect(() => {
    if (currentUniversityType && !form.university_type_id) {
      setForm((prev) => ({
        ...prev,
        university_type_id: currentUniversityType.id,
      }));
    }
  }, [currentUniversityType, form.university_type_id]);

  const universityTypeOptions = useMemo(() => {
    const options = [...universityTypes];

    // Add fetched current type if not already in list
    if (currentUniversityType) {
      const exists = options.some((t) => t.id === currentUniversityType.id);
      if (!exists) {
        options.unshift(currentUniversityType);
      }
    }

    // If form has a type ID that's not in options, it will still show as selected
    // because Select component just checks value equality
    return options;
  }, [universityTypes, currentUniversityType]);

  const activeStreams = useMemo(
    () =>
      streams
        .filter((s) => s.isActive)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [streams],
  );

  const toggleStream = (id: string) => {
    setMetaForm((prev) => {
      const ids = prev.overview.streamIds;
      return {
        ...prev,
        overview: {
          ...prev.overview,
          streamIds: ids.includes(id)
            ? ids.filter((x) => x !== id)
            : [...ids, id],
        },
      };
    });
  };

  const addMember = (council: "academic_council" | "management_council") =>
    setGovForm((prev) => {
      const lastMember =
        prev[council].members[prev[council].members.length - 1];
      if (lastMember && !isMemberComplete(lastMember)) {
        toast.error(
          "Fill current member name and designation before adding next",
        );
        return prev;
      }
      return {
        ...prev,
        [council]: {
          ...prev[council],
          members: [...prev[council].members, emptyMember()],
        },
      };
    });

  const updateMember = (
    council: "academic_council" | "management_council",
    idx: number,
    field: keyof GovernanceMemberForm,
    value: string,
  ) =>
    setGovForm((prev) => ({
      ...prev,
      [council]: {
        ...prev[council],
        members: prev[council].members.map((m, i) =>
          i === idx ? { ...m, [field]: value } : m,
        ),
      },
    }));

  const removeMember = (
    council: "academic_council" | "management_council",
    idx: number,
  ) =>
    setGovForm((prev) => ({
      ...prev,
      [council]: {
        ...prev[council],
        members: prev[council].members.filter((_, i) => i !== idx),
      },
    }));

  const addAccolade = () => {
    setMetaForm((prev) => {
      const last = prev.overview.accolades[prev.overview.accolades.length - 1];
      if (last && !isAccoladeComplete(last)) {
        toast.error("Fill current accolade before adding next");
        return prev;
      }
      return {
        ...prev,
        overview: {
          ...prev.overview,
          accolades: [...prev.overview.accolades, emptyAccolade()],
        },
      };
    });
  };

  const removeAccolade = (index: number) => {
    setMetaForm((prev) => {
      const next = prev.overview.accolades.filter((_, i) => i !== index);
      return {
        ...prev,
        overview: {
          ...prev.overview,
          accolades: next.length > 0 ? next : [emptyAccolade()],
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!university) return;
    let metadata: Record<string, unknown>;
    try {
      metadata = buildMetadata(metaForm, activeStreams);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid metadata");
      return;
    }
    updateMutation.mutate(
      {
        id: university.id,
        data: { ...form, metadata, governance: buildGovernance(govForm) },
      },
      {
        onSuccess: () => {
          toast.success("University updated successfully");
          router.push("/universities");
        },
      },
    );
  };

  const renderCouncil = (
    key: "academic_council" | "management_council",
    label: string,
  ) => (
    <div className="rounded-md border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => addMember(key)}
        >
          <PlusCircle className="h-3.5 w-3.5" /> Add member
        </Button>
      </div>
      <Input
        value={govForm[key].description}
        onChange={(e) =>
          setGovForm((prev) => ({
            ...prev,
            [key]: { ...prev[key], description: e.target.value },
          }))
        }
        placeholder={`${label} description`}
      />
      <div className="space-y-2">
        {govForm[key].members.map((member, index) => (
          <div
            key={`${key}-${index}`}
            className="grid gap-2 md:grid-cols-2 xl:grid-cols-5"
          >
            <ImageUpload
              value={member.userPhotoUrl}
              onChange={(url) => updateMember(key, index, "userPhotoUrl", url)}
              context={`universities/governance/${key}`}
              aspect={1}
              className="md:col-span-1"
            />
            <Input
              value={member.name}
              onChange={(e) => updateMember(key, index, "name", e.target.value)}
              placeholder={`Member ${index + 1} name`}
            />
            <Input
              value={member.designation}
              onChange={(e) =>
                updateMember(key, index, "designation", e.target.value)
              }
              placeholder="Designation"
            />
            <Input
              value={member.description}
              onChange={(e) =>
                updateMember(key, index, "description", e.target.value)
              }
              placeholder="Description"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="justify-self-start"
              disabled={govForm[key].members.length === 1}
              onClick={() => removeMember(key, index)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Edit University" description="Loading university...">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push("/universities")}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Edit University" description="University not found">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push("/universities")}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">University not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Edit University"
        description={university ? `Editing: ${university.name}` : "Loading..."}
      >
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => router.push("/universities")}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </Header>

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
                  <Edit className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg leading-tight">
                    Edit University
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Update university information and metadata
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">University Type</Label>
                  <Select
                    value={form.university_type_id || undefined}
                    onValueChange={(v) =>
                      setForm((prev) => ({ ...prev, university_type_id: v }))
                    }
                  >
                    <SelectTrigger id="edit-type">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {universityTypeOptions.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={form.name ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Delhi University"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug *</Label>
                  <Input
                    id="edit-slug"
                    value={form.slug ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
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
                      value={form.city ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, city: e.target.value }))
                      }
                      placeholder="e.g. New Delhi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-state">State</Label>
                    <Input
                      id="edit-state"
                      value={form.state ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, state: e.target.value }))
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
                    value={form.accreditation ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        accreditation: e.target.value,
                      }))
                    }
                    placeholder="e.g. NAAC A+"
                  />
                </div>

                <ImageUpload
                  label="Cover Image"
                  value={form.cover_url ?? ""}
                  onChange={(url) =>
                    setForm((prev) => ({ ...prev, cover_url: url }))
                  }
                  context="university-covers"
                />
                <ImageUpload
                  label="Logo"
                  value={form.logo_url ?? ""}
                  onChange={(url) =>
                    setForm((prev) => ({ ...prev, logo_url: url }))
                  }
                  context="university-logos"
                />

                <div className="flex gap-2 rounded-lg bg-muted/60 p-1">
                  {(["overview", "governance"] as const).map((tab) => (
                    <Button
                      key={tab}
                      type="button"
                      variant={activeTab === tab ? "default" : "ghost"}
                      size="sm"
                      className="flex-1 capitalize"
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </Button>
                  ))}
                </div>

                {/* Overview Tab */}
                <div
                  className={activeTab === "overview" ? "space-y-4" : "hidden"}
                >
                  <Label className="text-base font-semibold">Overview</Label>
                  <div className="space-y-2">
                    <Label htmlFor="edit-ov-desc">Description</Label>
                    <Input
                      id="edit-ov-desc"
                      value={metaForm.overview.description}
                      onChange={(e) =>
                        setMetaForm((prev) => ({
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
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Accolades</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={addAccolade}
                        disabled={
                          !isAccoladeComplete(
                            metaForm.overview.accolades[
                              metaForm.overview.accolades.length - 1
                            ],
                          )
                        }
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> Add accolade
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {metaForm.overview.accolades.map((accolade, index) => (
                        <div
                          key={`edit-accolade-${index}`}
                          className="grid gap-2 md:grid-cols-3 xl:grid-cols-5"
                        >
                          <ImageUpload
                            value={accolade.image}
                            onChange={(url) =>
                              setMetaForm((prev) => ({
                                ...prev,
                                overview: {
                                  ...prev.overview,
                                  accolades: prev.overview.accolades.map(
                                    (item, i) =>
                                      i === index
                                        ? { ...item, image: url }
                                        : item,
                                  ),
                                },
                              }))
                            }
                            context={`universities/overview/accolades-${index}`}
                          />
                          <Input
                            value={accolade.description}
                            onChange={(e) =>
                              setMetaForm((prev) => ({
                                ...prev,
                                overview: {
                                  ...prev.overview,
                                  accolades: prev.overview.accolades.map(
                                    (item, i) =>
                                      i === index
                                        ? {
                                            ...item,
                                            description: e.target.value,
                                          }
                                        : item,
                                  ),
                                },
                              }))
                            }
                            placeholder="Accolades description"
                          />
                          <Input
                            value={accolade.subdescription}
                            onChange={(e) =>
                              setMetaForm((prev) => ({
                                ...prev,
                                overview: {
                                  ...prev.overview,
                                  accolades: prev.overview.accolades.map(
                                    (item, i) =>
                                      i === index
                                        ? {
                                            ...item,
                                            subdescription: e.target.value,
                                          }
                                        : item,
                                  ),
                                },
                              }))
                            }
                            placeholder="Accolades subdescription"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="justify-self-start"
                            disabled={metaForm.overview.accolades.length === 1}
                            onClick={() => removeAccolade(index)}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border p-4 space-y-3">
                    <Label className="text-sm font-medium">
                      University Details
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        [
                          "est_date",
                          "nature_of_university",
                          "type_of_university",
                          "pincode",
                        ] as const
                      ).map((key) => (
                        <Input
                          key={key}
                          value={metaForm.overview.university_details[key]}
                          onChange={(e) =>
                            setMetaForm((prev) => ({
                              ...prev,
                              overview: {
                                ...prev.overview,
                                university_details: {
                                  ...prev.overview.university_details,
                                  [key]: e.target.value,
                                },
                              },
                            }))
                          }
                          placeholder={key.replace(/_/g, " ")}
                        />
                      ))}
                      <Input
                        type="number"
                        min={0}
                        value={
                          metaForm.overview.university_details
                            .affiliated_colleges
                        }
                        onChange={(e) =>
                          setMetaForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                affiliated_colleges: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Affiliated colleges count"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={
                          metaForm.overview.university_details
                            .autonomous_colleges
                        }
                        onChange={(e) =>
                          setMetaForm((prev) => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              university_details: {
                                ...prev.overview.university_details,
                                autonomous_colleges: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Autonomous colleges count"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Academic Offerings (Streams)</Label>
                    <div className="rounded-md border border-input bg-background p-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Select one or more streams for this university.
                      </p>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {activeStreams.map((stream) => {
                          const isSelected =
                            metaForm.overview.streamIds.includes(stream.id);
                          return (
                            <button
                              key={stream.id}
                              type="button"
                              onClick={() => toggleStream(stream.id)}
                              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${isSelected ? "border-primary bg-primary/5" : "border-input hover:bg-muted/40"}`}
                            >
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-sm border ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}
                              >
                                {isSelected && <Check className="h-3 w-3" />}
                              </span>
                              <span>{stream.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <VideoListEditor
                    value={metaForm.overview.videosJson}
                    onChange={(json) =>
                      setMetaForm((prev) => ({
                        ...prev,
                        overview: { ...prev.overview, videosJson: json },
                      }))
                    }
                  />
                </div>

                {/* Governance Tab */}
                <div
                  className={
                    activeTab === "governance" ? "space-y-4" : "hidden"
                  }
                >
                  <Label className="text-base font-semibold">Governance</Label>
                  {renderCouncil("academic_council", "Academic Council")}
                  {renderCouncil("management_council", "Management Council")}
                  <div className="rounded-md border p-4 space-y-3">
                    <Label className="text-sm font-medium">
                      Organizational Organogram
                    </Label>
                    <Input
                      value={govForm.organizational_organogram.title}
                      onChange={(e) =>
                        setGovForm((prev) => ({
                          ...prev,
                          organizational_organogram: {
                            ...prev.organizational_organogram,
                            title: e.target.value,
                          },
                        }))
                      }
                      placeholder="Title"
                    />
                    <FileUpload
                      value={govForm.organizational_organogram.fileUrl}
                      onChange={(url) =>
                        setGovForm((prev) => ({
                          ...prev,
                          organizational_organogram: {
                            ...prev.organizational_organogram,
                            fileUrl: url,
                          },
                        }))
                      }
                      context="universities/governance/organogram"
                    />
                    <Input
                      value={govForm.organizational_organogram.description}
                      onChange={(e) =>
                        setGovForm((prev) => ({
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

              <div className="flex justify-end gap-3 p-5 border-t bg-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/universities")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-[140px]"
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
      </div>
    </div>
  );
}
