"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
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
import type { CreateUniversityInput } from "@/lib/services/universities.service";
import { useCreateUniversity } from "@/hooks/use-universities";
import { useAllActiveStreams } from "@/hooks/use-academic-taxonomy";
import { useUniversityTypes } from "@/hooks/use-university-types";

// ── helpers ──────────────────────────────────────────────────────────────────

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

function createEmptyMember(): GovernanceMemberForm {
  return { userPhotoUrl: "", name: "", designation: "", description: "" };
}

function createEmptyAccolade(): UniversityAccoladeForm {
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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeToArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (v === null || v === undefined) return [];
  return [v];
}

function parseJsonArray(value: string, fieldName: string): unknown[] {
  if (!value.trim()) return [];
  try {
    return normalizeToArray(JSON.parse(value));
  } catch {
    throw new Error(`${fieldName} must be valid JSON array`);
  }
}

function buildStructuredMetadata(
  form: UniversityMetadataForm,
  availableStreams: Array<{ id: string; name: string; slug: string }>,
): Record<string, unknown> {
  const streamMap = new Map(availableStreams.map((s) => [s.id, s]));
  const selectedStreams = form.overview.streamIds
    .map((id) => streamMap.get(id))
    .filter((s): s is { id: string; name: string; slug: string } => Boolean(s))
    .map((s) => ({ id: s.id, name: s.name, slug: s.slug }));

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
      streams: selectedStreams,
      videos: parseJsonArray(form.overview.videosJson, "Videos"),
    },
  };
}

function buildStructuredGovernance(
  form: UniversityGovernanceForm,
): NonNullable<CreateUniversityInput["governance"]> {
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

// ── constants ─────────────────────────────────────────────────────────────────

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

const EMPTY_METADATA: UniversityMetadataForm = {
  overview: {
    description: "",
    accolades: [createEmptyAccolade()],
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

const EMPTY_GOVERNANCE: UniversityGovernanceForm = {
  academic_council: { description: "", members: [createEmptyMember()] },
  management_council: { description: "", members: [createEmptyMember()] },
  organizational_organogram: { title: "", fileUrl: "", description: "" },
};

// ── page ─────────────────────────────────────────────────────────────────────

export default function NewUniversityPage() {
  const router = useRouter();
  const { data: universityTypes = [] } = useUniversityTypes();
  const { data: streams = [] } = useAllActiveStreams();
  const createMutation = useCreateUniversity();

  const [form, setForm] = useState<CreateUniversityInput>(EMPTY_CREATE_FORM);
  const [metadataForm, setMetadataForm] =
    useState<UniversityMetadataForm>(EMPTY_METADATA);
  const [governanceForm, setGovernanceForm] =
    useState<UniversityGovernanceForm>(EMPTY_GOVERNANCE);
  const [activeTab, setActiveTab] = useState<"overview" | "governance">(
    "overview",
  );

  const activeStreams = useMemo(
    () =>
      streams
        .filter((s) => s.isActive)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [streams],
  );

  const handleNameChange = (value: string) => {
    setForm((prev) => ({ ...prev, name: value, slug: toSlug(value) }));
  };

  const toggleStream = (id: string) => {
    setMetadataForm((prev) => {
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

  const addMember = (council: "academic_council" | "management_council") => {
    const lastMember =
      governanceForm[council].members[
        governanceForm[council].members.length - 1
      ];
    if (lastMember && !isMemberComplete(lastMember)) {
      toast.error(
        "Fill current member name and designation before adding next",
      );
      return;
    }
    setGovernanceForm((prev) => ({
      ...prev,
      [council]: {
        ...prev[council],
        members: [...prev[council].members, createEmptyMember()],
      },
    }));
  };

  const updateMember = (
    council: "academic_council" | "management_council",
    index: number,
    field: keyof GovernanceMemberForm,
    value: string,
  ) => {
    setGovernanceForm((prev) => ({
      ...prev,
      [council]: {
        ...prev[council],
        members: prev[council].members.map((m, i) =>
          i === index ? { ...m, [field]: value } : m,
        ),
      },
    }));
  };

  const removeMember = (
    council: "academic_council" | "management_council",
    index: number,
  ) => {
    setGovernanceForm((prev) => ({
      ...prev,
      [council]: {
        ...prev[council],
        members: prev[council].members.filter((_, i) => i !== index),
      },
    }));
  };

  const addAccolade = () => {
    const accolades = metadataForm.overview.accolades;
    const lastAccolade = accolades[accolades.length - 1];
    if (lastAccolade && !isAccoladeComplete(lastAccolade)) {
      toast.error("Fill current accolade before adding next");
      return;
    }

    setMetadataForm((prev) => ({
      ...prev,
      overview: {
        ...prev.overview,
        accolades: [...prev.overview.accolades, createEmptyAccolade()],
      },
    }));
  };

  const removeAccolade = (index: number) => {
    setMetadataForm((prev) => {
      const next = prev.overview.accolades.filter((_, i) => i !== index);
      return {
        ...prev,
        overview: {
          ...prev.overview,
          accolades: next.length > 0 ? next : [createEmptyAccolade()],
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let metadata: Record<string, unknown>;
    try {
      metadata = buildStructuredMetadata(metadataForm, activeStreams);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid metadata");
      return;
    }
    const payload: CreateUniversityInput = {
      university_type_id: form.university_type_id,
      name: form.name,
      slug: form.slug,
      ...(form.state ? { state: form.state } : {}),
      ...(form.city ? { city: form.city } : {}),
      ...(form.accreditation ? { accreditation: form.accreditation } : {}),
      ...(form.cover_url ? { cover_url: form.cover_url } : {}),
      ...(form.governance_details
        ? { governance_details: form.governance_details }
        : {}),
      ...(form.logo_url ? { logo_url: form.logo_url } : {}),
      metadata,
      governance: buildStructuredGovernance(governanceForm),
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("University created successfully");
        router.push("/universities");
      },
    });
  };

  // ── render council section ────────────────────────────────────────────────

  const renderCouncil = (
    councilKey: "academic_council" | "management_council",
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
          onClick={() => addMember(councilKey)}
        >
          <PlusCircle className="h-3.5 w-3.5" /> Add member
        </Button>
      </div>
      <Input
        value={governanceForm[councilKey].description}
        onChange={(e) =>
          setGovernanceForm((prev) => ({
            ...prev,
            [councilKey]: {
              ...prev[councilKey],
              description: e.target.value,
            },
          }))
        }
        placeholder={`${label} description`}
      />
      <div className="space-y-2">
        {governanceForm[councilKey].members.map((member, index) => (
          <div
            key={`${councilKey}-${index}`}
            className="grid gap-2 md:grid-cols-2 xl:grid-cols-5"
          >
            <ImageUpload
              value={member.userPhotoUrl}
              onChange={(url) =>
                updateMember(councilKey, index, "userPhotoUrl", url)
              }
              context={`universities/governance/${councilKey}`}
              aspect={1}
              className="md:col-span-1"
            />
            <Input
              value={member.name}
              onChange={(e) =>
                updateMember(councilKey, index, "name", e.target.value)
              }
              placeholder={`Member ${index + 1} name`}
            />
            <Input
              value={member.designation}
              onChange={(e) =>
                updateMember(councilKey, index, "designation", e.target.value)
              }
              placeholder="Designation"
            />
            <Input
              value={member.description}
              onChange={(e) =>
                updateMember(councilKey, index, "description", e.target.value)
              }
              placeholder="Description"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="justify-self-start"
              disabled={governanceForm[councilKey].members.length === 1}
              onClick={() => removeMember(councilKey, index)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  // ── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Add University"
        description="Fill in the details to create a new university"
      >
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => router.push("/universities")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Header>

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg leading-tight">
                    New University
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All required fields are marked below
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-5">
                {/* ── Basic Info ── */}
                <div className="space-y-2">
                  <Label htmlFor="type">University Type *</Label>
                  <Select
                    value={form.university_type_id}
                    onValueChange={(v) =>
                      setForm((prev) => ({ ...prev, university_type_id: v }))
                    }
                    required
                  >
                    <SelectTrigger id="type">
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
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Delhi University"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={form.slug}
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
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, city: e.target.value }))
                      }
                      placeholder="e.g. New Delhi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={form.state}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, state: e.target.value }))
                      }
                      placeholder="e.g. Delhi"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accreditation">
                    Accreditation{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="accreditation"
                    value={form.accreditation}
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
                  label="Cover Image (optional)"
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

                {/* ── Metadata Tabs ── */}
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

                {/* ── Overview Tab ── */}
                <div
                  className={activeTab === "overview" ? "space-y-4" : "hidden"}
                >
                  <Label className="text-base font-semibold">Overview</Label>

                  <div className="space-y-2">
                    <Label htmlFor="overview-desc">Description</Label>
                    <Input
                      id="overview-desc"
                      value={metadataForm.overview.description}
                      onChange={(e) =>
                        setMetadataForm((prev) => ({
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
                            metadataForm.overview.accolades[
                              metadataForm.overview.accolades.length - 1
                            ],
                          )
                        }
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> Add accolade
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {metadataForm.overview.accolades.map(
                        (accolade, index) => (
                          <div
                            key={`accolade-${index}`}
                            className="grid gap-2 md:grid-cols-3 xl:grid-cols-5"
                          >
                            <ImageUpload
                              value={accolade.image}
                              onChange={(url) =>
                                setMetadataForm((prev) => ({
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
                                setMetadataForm((prev) => ({
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
                                setMetadataForm((prev) => ({
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
                              disabled={
                                metadataForm.overview.accolades.length === 1
                              }
                              onClick={() => removeAccolade(index)}
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
                      University Details
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        [
                          ["est_date", "Established date"],
                          ["nature_of_university", "Nature of university"],
                          ["type_of_university", "Type of university"],
                          ["pincode", "Pincode"],
                        ] as const
                      ).map(([key, placeholder]) => (
                        <Input
                          key={key}
                          value={metadataForm.overview.university_details[key]}
                          onChange={(e) =>
                            setMetadataForm((prev) => ({
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
                          placeholder={placeholder}
                        />
                      ))}
                      <Input
                        type="number"
                        min={0}
                        value={
                          metadataForm.overview.university_details
                            .affiliated_colleges
                        }
                        onChange={(e) =>
                          setMetadataForm((prev) => ({
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
                          metadataForm.overview.university_details
                            .autonomous_colleges
                        }
                        onChange={(e) =>
                          setMetadataForm((prev) => ({
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
                      {activeStreams.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No active streams found.
                        </p>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {activeStreams.map((stream) => {
                            const isSelected =
                              metadataForm.overview.streamIds.includes(
                                stream.id,
                              );
                            return (
                              <button
                                key={stream.id}
                                type="button"
                                onClick={() => toggleStream(stream.id)}
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

                  <VideoListEditor
                    value={metadataForm.overview.videosJson}
                    onChange={(json) =>
                      setMetadataForm((prev) => ({
                        ...prev,
                        overview: { ...prev.overview, videosJson: json },
                      }))
                    }
                  />
                </div>

                {/* ── Governance Tab ── */}
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
                      value={governanceForm.organizational_organogram.title}
                      onChange={(e) =>
                        setGovernanceForm((prev) => ({
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
                      value={governanceForm.organizational_organogram.fileUrl}
                      onChange={(url) =>
                        setGovernanceForm((prev) => ({
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
                      value={
                        governanceForm.organizational_organogram.description
                      }
                      onChange={(e) =>
                        setGovernanceForm((prev) => ({
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

              {/* ── Footer ── */}
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
                  className="min-w-[160px]"
                  disabled={
                    !form.university_type_id ||
                    !form.name ||
                    !form.slug ||
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
      </div>
    </div>
  );
}
