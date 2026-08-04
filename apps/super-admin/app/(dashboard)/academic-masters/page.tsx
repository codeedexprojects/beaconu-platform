"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, X, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";
import type {
  StreamLookup,
  Discipline,
  StudyLevel,
  ProgramType,
} from "@/lib/services/academic-taxonomy.service";
import {
  useCreateStream,
  useUpdateStream,
  useCreateDiscipline,
  useUpdateDiscipline,
  useCreateProgramType,
  useUpdateProgramType,
  useCreateStudyLevel,
  useUpdateStudyLevel,
  useEnableStream,
  useDisableStream,
  useEnableDiscipline,
  useDisableDiscipline,
  useEnableProgramType,
  useDisableProgramType,
  useEnableStudyLevel,
  useDisableStudyLevel,
  useDisciplines,
  useProgramTypes,
  useStreams,
  useStudyLevels,
  useAllActiveStreams,
} from "@/hooks/use-academic-taxonomy";

const PAGE_SIZE = 10;

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t mt-2">
      <p className="text-xs text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

type Tab = "streams" | "disciplines" | "study-levels" | "program-types";

const TABS: { id: Tab; label: string }[] = [
  { id: "streams", label: "Streams" },
  { id: "disciplines", label: "Disciplines" },
  { id: "study-levels", label: "Study Levels" },
  { id: "program-types", label: "Program Types" },
];

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function TabNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <div className="flex gap-1 border-b mb-6">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            active === t.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function AcademicMastersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("streams");
  const [showForm, setShowForm] = useState(false);

  const [streamPage, setStreamPage] = useState(1);
  const [disciplinePage, setDisciplinePage] = useState(1);
  const [studyLevelPage, setStudyLevelPage] = useState(1);
  const [programTypePage, setProgramTypePage] = useState(1);

  const { data: streamsPage, isLoading: isLoadingStreams } = useStreams({
    page: streamPage,
    limit: PAGE_SIZE,
  });
  const { data: disciplinesPage, isLoading: isLoadingDisciplines } =
    useDisciplines({ page: disciplinePage, limit: PAGE_SIZE });
  const { data: studyLevelsPage, isLoading: isLoadingStudyLevels } =
    useStudyLevels({ page: studyLevelPage, limit: PAGE_SIZE });
  const { data: programTypesPage, isLoading: isLoadingProgramTypes } =
    useProgramTypes({ page: programTypePage, limit: PAGE_SIZE });

  const { data: allActiveStreams = [] } = useAllActiveStreams();

  const streams = streamsPage?.data ?? [];
  const streamsMeta = streamsPage?.meta;
  const disciplines = disciplinesPage?.data ?? [];
  const disciplinesMeta = disciplinesPage?.meta;
  const studyLevels = studyLevelsPage?.data ?? [];
  const studyLevelsMeta = studyLevelsPage?.meta;
  const programTypes = programTypesPage?.data ?? [];
  const programTypesMeta = programTypesPage?.meta;

  const createStream = useCreateStream();
  const updateStream = useUpdateStream();
  const enableStream = useEnableStream();
  const disableStream = useDisableStream();
  const createDiscipline = useCreateDiscipline();
  const updateDiscipline = useUpdateDiscipline();
  const enableDiscipline = useEnableDiscipline();
  const disableDiscipline = useDisableDiscipline();
  const createStudyLevel = useCreateStudyLevel();
  const updateStudyLevel = useUpdateStudyLevel();
  const enableStudyLevel = useEnableStudyLevel();
  const disableStudyLevel = useDisableStudyLevel();
  const createProgramType = useCreateProgramType();
  const updateProgramType = useUpdateProgramType();
  const enableProgramType = useEnableProgramType();
  const disableProgramType = useDisableProgramType();

  const [streamForm, setStreamForm] = useState({
    name: "",
    logo_url: "",
    sort_order: 0,
  });
  const [disciplineForm, setDisciplineForm] = useState({
    stream_id: "",
    name: "",
    logo_url: "",
    sort_order: 0,
  });
  const [studyLevelForm, setStudyLevelForm] = useState({
    name: "",
    sort_order: 0,
  });
  const [programTypeForm, setProgramTypeForm] = useState({
    name: "",
    sort_order: 0,
  });

  const [editingStream, setEditingStream] = useState<StreamLookup | null>(null);
  const [editStreamForm, setEditStreamForm] = useState({
    name: "",
    logo_url: "",
    sort_order: 0,
  });
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(
    null,
  );
  const [editDisciplineForm, setEditDisciplineForm] = useState({
    stream_id: "",
    name: "",
    logo_url: "",
    sort_order: 0,
  });
  const [editingStudyLevel, setEditingStudyLevel] = useState<StudyLevel | null>(
    null,
  );
  const [editStudyLevelForm, setEditStudyLevelForm] = useState({
    name: "",
    sort_order: 0,
  });
  const [editingProgramType, setEditingProgramType] =
    useState<ProgramType | null>(null);
  const [editProgramTypeForm, setEditProgramTypeForm] = useState({
    name: "",
    sort_order: 0,
  });

  const sortedActiveStreams = useMemo(
    () => allActiveStreams.filter((s) => s.isActive),
    [allActiveStreams],
  );

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setShowForm(false);
  }

  const handleCreateStream = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createStream.mutate(
      {
        ...streamForm,
        slug: slugify(streamForm.name),
        logo_url: streamForm.logo_url || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Stream added");
          setStreamForm({ name: "", logo_url: "", sort_order: 0 });
          setShowForm(false);
        },
      },
    );
  };

  const handleCreateDiscipline = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!disciplineForm.stream_id) {
      toast.error("Please select a stream");
      return;
    }
    createDiscipline.mutate(
      {
        ...disciplineForm,
        slug: slugify(disciplineForm.name),
        logo_url: disciplineForm.logo_url || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Discipline added");
          setDisciplineForm({
            stream_id: disciplineForm.stream_id,
            name: "",
            logo_url: "",
            sort_order: 0,
          });
          setShowForm(false);
        },
      },
    );
  };

  function openEditStream(stream: StreamLookup) {
    setEditStreamForm({
      name: stream.name,
      logo_url: stream.logoUrl ?? "",
      sort_order: stream.sortOrder,
    });
    setEditingStream(stream);
  }

  const handleUpdateStream = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStream) return;
    updateStream.mutate(
      {
        id: editingStream.id,
        data: {
          ...editStreamForm,
          slug: slugify(editStreamForm.name),
          logo_url: editStreamForm.logo_url || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Stream updated");
          setEditingStream(null);
        },
      },
    );
  };

  function openEditDiscipline(discipline: Discipline) {
    setEditDisciplineForm({
      stream_id: discipline.streamId,
      name: discipline.name,
      logo_url: discipline.logoUrl ?? "",
      sort_order: discipline.sortOrder,
    });
    setEditingDiscipline(discipline);
  }

  const handleUpdateDiscipline = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDiscipline) return;
    if (!editDisciplineForm.stream_id) {
      toast.error("Please select a stream");
      return;
    }
    updateDiscipline.mutate(
      {
        id: editingDiscipline.id,
        data: {
          ...editDisciplineForm,
          slug: slugify(editDisciplineForm.name),
          logo_url: editDisciplineForm.logo_url || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Discipline updated");
          setEditingDiscipline(null);
        },
      },
    );
  };

  const handleCreateStudyLevel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createStudyLevel.mutate(
      { ...studyLevelForm, slug: slugify(studyLevelForm.name) },
      {
        onSuccess: () => {
          toast.success("Study level added");
          setStudyLevelForm({ name: "", sort_order: 0 });
          setShowForm(false);
        },
      },
    );
  };

  const handleCreateProgramType = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createProgramType.mutate(
      { ...programTypeForm, slug: slugify(programTypeForm.name) },
      {
        onSuccess: () => {
          toast.success("Program type added");
          setProgramTypeForm({ name: "", sort_order: 0 });
          setShowForm(false);
        },
      },
    );
  };

  function openEditStudyLevel(level: StudyLevel) {
    setEditStudyLevelForm({ name: level.name, sort_order: level.sortOrder });
    setEditingStudyLevel(level);
  }

  const handleUpdateStudyLevel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStudyLevel) return;
    updateStudyLevel.mutate(
      {
        id: editingStudyLevel.id,
        data: {
          ...editStudyLevelForm,
          slug: slugify(editStudyLevelForm.name),
        },
      },
      {
        onSuccess: () => {
          toast.success("Study level updated");
          setEditingStudyLevel(null);
        },
      },
    );
  };

  function openEditProgramType(type: ProgramType) {
    setEditProgramTypeForm({ name: type.name, sort_order: type.sortOrder });
    setEditingProgramType(type);
  }

  const handleUpdateProgramType = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProgramType) return;
    updateProgramType.mutate(
      {
        id: editingProgramType.id,
        data: {
          ...editProgramTypeForm,
          slug: slugify(editProgramTypeForm.name),
        },
      },
      {
        onSuccess: () => {
          toast.success("Program type updated");
          setEditingProgramType(null);
        },
      },
    );
  };

  return (
    <>
      <Header
        title="Academic Masters"
        description="Manage disciplines, study levels, and program types used during college registration setup."
      />

      <div className="p-6">
        <TabNav active={activeTab} onChange={switchTab} />

        {activeTab === "streams" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Streams</CardTitle>
              <Button
                size="sm"
                variant={showForm ? "ghost" : "default"}
                onClick={() => setShowForm((v) => !v)}
              >
                {showForm ? (
                  <>
                    <X className="h-4 w-4 mr-1.5" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Stream
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {showForm && (
                <form
                  onSubmit={handleCreateStream}
                  className="grid gap-3 md:grid-cols-4 border rounded-lg p-4 bg-muted/30"
                >
                  <div className="space-y-2 md:col-span-3">
                    <Label>Name</Label>
                    <Input
                      value={streamForm.name}
                      onChange={(e) =>
                        setStreamForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Engineering"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={streamForm.sort_order}
                      onChange={(e) =>
                        setStreamForm((prev) => ({
                          ...prev,
                          sort_order: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </div>

                  <div className="md:col-span-4">
                    <ImageUpload
                      label="Icon (optional)"
                      value={streamForm.logo_url}
                      onChange={(url) =>
                        setStreamForm((prev) => ({ ...prev, logo_url: url }))
                      }
                      context="stream-icons"
                      aspect={1}
                    />
                  </div>

                  <div className="md:col-span-4">
                    <Button type="submit" disabled={createStream.isPending}>
                      Save Stream
                    </Button>
                  </div>
                </form>
              )}

              {isLoadingStreams ? (
                <p className="text-sm text-muted-foreground">
                  Loading streams…
                </p>
              ) : streams.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No streams yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {streams.map((stream) => (
                    <div
                      key={stream.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        {stream.logoUrl && (
                          <img
                            src={stream.logoUrl}
                            alt=""
                            className="h-6 w-6 shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-medium">{stream.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {stream.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openEditStream(stream)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Badge
                          variant={stream.isActive ? "success" : "secondary"}
                        >
                          {stream.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={stream.isActive}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              enableStream.mutate(stream.id, {
                                onSuccess: () =>
                                  toast.success("Stream enabled"),
                              });
                            } else {
                              disableStream.mutate(stream.id, {
                                onSuccess: () =>
                                  toast.success("Stream disabled"),
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Pagination
                page={streamPage}
                totalPages={streamsMeta?.totalPages ?? 1}
                onPrev={() => setStreamPage((p) => p - 1)}
                onNext={() => setStreamPage((p) => p + 1)}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "disciplines" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Disciplines</CardTitle>
              <Button
                size="sm"
                variant={showForm ? "ghost" : "default"}
                onClick={() => setShowForm((v) => !v)}
              >
                {showForm ? (
                  <>
                    <X className="h-4 w-4 mr-1.5" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Discipline
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {showForm && (
                <form
                  onSubmit={handleCreateDiscipline}
                  className="grid gap-3 md:grid-cols-4 border rounded-lg p-4 bg-muted/30"
                >
                  <div className="space-y-2">
                    <Label>Stream</Label>
                    <Select
                      value={disciplineForm.stream_id}
                      onValueChange={(value) =>
                        setDisciplineForm((prev) => ({
                          ...prev,
                          stream_id: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stream" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedActiveStreams.map((stream) => (
                          <SelectItem key={stream.id} value={stream.id}>
                            {stream.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Name</Label>
                    <Input
                      value={disciplineForm.name}
                      onChange={(e) =>
                        setDisciplineForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Computer Science"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={disciplineForm.sort_order}
                      onChange={(e) =>
                        setDisciplineForm((prev) => ({
                          ...prev,
                          sort_order: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </div>

                  <div className="md:col-span-4">
                    <ImageUpload
                      label="Icon (optional)"
                      value={disciplineForm.logo_url}
                      onChange={(url) =>
                        setDisciplineForm((prev) => ({
                          ...prev,
                          logo_url: url,
                        }))
                      }
                      context="discipline-icons"
                      aspect={1}
                    />
                  </div>

                  <div className="md:col-span-4">
                    <Button
                      type="submit"
                      disabled={createDiscipline.isPending || isLoadingStreams}
                    >
                      Save Discipline
                    </Button>
                  </div>
                </form>
              )}

              {isLoadingDisciplines ? (
                <p className="text-sm text-muted-foreground">
                  Loading disciplines…
                </p>
              ) : disciplines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No disciplines yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {disciplines.map((discipline) => (
                    <div
                      key={discipline.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        {discipline.logoUrl && (
                          <img
                            src={discipline.logoUrl}
                            alt=""
                            className="h-6 w-6 shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-medium">{discipline.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {discipline.slug} · {discipline.stream.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openEditDiscipline(discipline)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Badge
                          variant={
                            discipline.isActive ? "success" : "secondary"
                          }
                        >
                          {discipline.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={discipline.isActive}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              enableDiscipline.mutate(discipline.id, {
                                onSuccess: () =>
                                  toast.success("Discipline enabled"),
                              });
                            } else {
                              disableDiscipline.mutate(discipline.id, {
                                onSuccess: () =>
                                  toast.success("Discipline disabled"),
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Pagination
                page={disciplinePage}
                totalPages={disciplinesMeta?.totalPages ?? 1}
                onPrev={() => setDisciplinePage((p) => p - 1)}
                onNext={() => setDisciplinePage((p) => p + 1)}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "study-levels" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Study Levels</CardTitle>
              <Button
                size="sm"
                variant={showForm ? "ghost" : "default"}
                onClick={() => setShowForm((v) => !v)}
              >
                {showForm ? (
                  <>
                    <X className="h-4 w-4 mr-1.5" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Study Level
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {showForm && (
                <form
                  onSubmit={handleCreateStudyLevel}
                  className="grid gap-3 md:grid-cols-4 border rounded-lg p-4 bg-muted/30"
                >
                  <div className="space-y-2 md:col-span-3">
                    <Label>Name</Label>
                    <Input
                      value={studyLevelForm.name}
                      onChange={(e) =>
                        setStudyLevelForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Undergraduate"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={studyLevelForm.sort_order}
                      onChange={(e) =>
                        setStudyLevelForm((prev) => ({
                          ...prev,
                          sort_order: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </div>

                  <div className="md:col-span-4">
                    <Button type="submit" disabled={createStudyLevel.isPending}>
                      Save Study Level
                    </Button>
                  </div>
                </form>
              )}

              {isLoadingStudyLevels ? (
                <p className="text-sm text-muted-foreground">
                  Loading study levels…
                </p>
              ) : studyLevels.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No study levels yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {studyLevels.map((level) => (
                    <div
                      key={level.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{level.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {level.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openEditStudyLevel(level)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Badge
                          variant={level.isActive ? "success" : "secondary"}
                        >
                          {level.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={level.isActive}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              enableStudyLevel.mutate(level.id, {
                                onSuccess: () =>
                                  toast.success("Study level enabled"),
                              });
                            } else {
                              disableStudyLevel.mutate(level.id, {
                                onSuccess: () =>
                                  toast.success("Study level disabled"),
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Pagination
                page={studyLevelPage}
                totalPages={studyLevelsMeta?.totalPages ?? 1}
                onPrev={() => setStudyLevelPage((p) => p - 1)}
                onNext={() => setStudyLevelPage((p) => p + 1)}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "program-types" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Program Types</CardTitle>
              <Button
                size="sm"
                variant={showForm ? "ghost" : "default"}
                onClick={() => setShowForm((v) => !v)}
              >
                {showForm ? (
                  <>
                    <X className="h-4 w-4 mr-1.5" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Program Type
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {showForm && (
                <form
                  onSubmit={handleCreateProgramType}
                  className="grid gap-3 md:grid-cols-4 border rounded-lg p-4 bg-muted/30"
                >
                  <div className="space-y-2 md:col-span-3">
                    <Label>Name</Label>
                    <Input
                      value={programTypeForm.name}
                      onChange={(e) =>
                        setProgramTypeForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Degree"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={programTypeForm.sort_order}
                      onChange={(e) =>
                        setProgramTypeForm((prev) => ({
                          ...prev,
                          sort_order: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </div>

                  <div className="md:col-span-4">
                    <Button
                      type="submit"
                      disabled={createProgramType.isPending}
                    >
                      Save Program Type
                    </Button>
                  </div>
                </form>
              )}

              {isLoadingProgramTypes ? (
                <p className="text-sm text-muted-foreground">
                  Loading program types…
                </p>
              ) : programTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No program types yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {programTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{type.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {type.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openEditProgramType(type)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Badge
                          variant={type.isActive ? "success" : "secondary"}
                        >
                          {type.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={type.isActive}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              enableProgramType.mutate(type.id, {
                                onSuccess: () =>
                                  toast.success("Program type enabled"),
                              });
                            } else {
                              disableProgramType.mutate(type.id, {
                                onSuccess: () =>
                                  toast.success("Program type disabled"),
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Pagination
                page={programTypePage}
                totalPages={programTypesMeta?.totalPages ?? 1}
                onPrev={() => setProgramTypePage((p) => p - 1)}
                onNext={() => setProgramTypePage((p) => p + 1)}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {editingStream && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingStream(null);
          }}
        >
          <Card className="w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Edit Stream</h3>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setEditingStream(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form
              onSubmit={handleUpdateStream}
              className="space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editStreamForm.name}
                  onChange={(e) =>
                    setEditStreamForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={editStreamForm.sort_order}
                  onChange={(e) =>
                    setEditStreamForm((prev) => ({
                      ...prev,
                      sort_order: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>

              <ImageUpload
                label="Icon (optional)"
                value={editStreamForm.logo_url}
                onChange={(url) =>
                  setEditStreamForm((prev) => ({ ...prev, logo_url: url }))
                }
                context="stream-icons"
                aspect={1}
              />

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingStream(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateStream.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {editingDiscipline && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingDiscipline(null);
          }}
        >
          <Card className="w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Edit Discipline</h3>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setEditingDiscipline(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form
              onSubmit={handleUpdateDiscipline}
              className="space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div className="space-y-2">
                <Label>Stream</Label>
                <Select
                  value={editDisciplineForm.stream_id}
                  onValueChange={(value) =>
                    setEditDisciplineForm((prev) => ({
                      ...prev,
                      stream_id: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stream" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedActiveStreams.map((stream) => (
                      <SelectItem key={stream.id} value={stream.id}>
                        {stream.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editDisciplineForm.name}
                  onChange={(e) =>
                    setEditDisciplineForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={editDisciplineForm.sort_order}
                  onChange={(e) =>
                    setEditDisciplineForm((prev) => ({
                      ...prev,
                      sort_order: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>

              <ImageUpload
                label="Icon (optional)"
                value={editDisciplineForm.logo_url}
                onChange={(url) =>
                  setEditDisciplineForm((prev) => ({
                    ...prev,
                    logo_url: url,
                  }))
                }
                context="discipline-icons"
                aspect={1}
              />

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingDiscipline(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateDiscipline.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {editingStudyLevel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingStudyLevel(null);
          }}
        >
          <Card className="w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Edit Study Level</h3>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setEditingStudyLevel(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleUpdateStudyLevel} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editStudyLevelForm.name}
                  onChange={(e) =>
                    setEditStudyLevelForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={editStudyLevelForm.sort_order}
                  onChange={(e) =>
                    setEditStudyLevelForm((prev) => ({
                      ...prev,
                      sort_order: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingStudyLevel(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateStudyLevel.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {editingProgramType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingProgramType(null);
          }}
        >
          <Card className="w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Edit Program Type</h3>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setEditingProgramType(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleUpdateProgramType} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editProgramTypeForm.name}
                  onChange={(e) =>
                    setEditProgramTypeForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={editProgramTypeForm.sort_order}
                  onChange={(e) =>
                    setEditProgramTypeForm((prev) => ({
                      ...prev,
                      sort_order: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProgramType(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateProgramType.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
