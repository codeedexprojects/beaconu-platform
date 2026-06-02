"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  useCreateStream,
  useCreateDiscipline,
  useCreateProgramType,
  useCreateStudyLevel,
  useDisableStream,
  useDisableDiscipline,
  useDisableProgramType,
  useDisableStudyLevel,
  useDisciplines,
  useProgramTypes,
  useStreams,
  useStudyLevels,
} from "@/hooks/use-academic-taxonomy";

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

  const { data: streams = [], isLoading: isLoadingStreams } = useStreams();
  const { data: disciplines = [], isLoading: isLoadingDisciplines } =
    useDisciplines();
  const { data: studyLevels = [], isLoading: isLoadingStudyLevels } =
    useStudyLevels();
  const { data: programTypes = [], isLoading: isLoadingProgramTypes } =
    useProgramTypes();

  const createStream = useCreateStream();
  const disableStream = useDisableStream();
  const createDiscipline = useCreateDiscipline();
  const disableDiscipline = useDisableDiscipline();
  const createStudyLevel = useCreateStudyLevel();
  const disableStudyLevel = useDisableStudyLevel();
  const createProgramType = useCreateProgramType();
  const disableProgramType = useDisableProgramType();

  const [streamForm, setStreamForm] = useState({ name: "", sort_order: 0 });
  const [disciplineForm, setDisciplineForm] = useState({
    stream_id: "",
    name: "",
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

  const sortedStreams = useMemo(
    () => streams.slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [streams],
  );

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setShowForm(false);
  }

  const handleCreateStream = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createStream.mutate(
      { ...streamForm, slug: slugify(streamForm.name) },
      {
        onSuccess: () => {
          toast.success("Stream added");
          setStreamForm({ name: "", sort_order: 0 });
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
      { ...disciplineForm, slug: slugify(disciplineForm.name) },
      {
        onSuccess: () => {
          toast.success("Discipline added");
          setDisciplineForm({
            stream_id: disciplineForm.stream_id,
            name: "",
            sort_order: 0,
          });
          setShowForm(false);
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

  return (
    <>
      <Header
        title="Academic Masters"
        description="Manage disciplines, study levels, and program types used during college registration setup."
      />

      <div className="p-6">
        <TabNav active={activeTab} onChange={switchTab} />

        {/* ── Streams ──────────────────────────────────────────────── */}
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
              ) : sortedStreams.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No streams yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedStreams.map((stream) => (
                    <div
                      key={stream.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{stream.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {stream.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={stream.isActive ? "success" : "secondary"}
                        >
                          {stream.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={stream.isActive}
                          onCheckedChange={() => {
                            if (stream.isActive) {
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
            </CardContent>
          </Card>
        )}

        {/* ── Disciplines ──────────────────────────────────────────── */}
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
                        {sortedStreams.map((stream) => (
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
                      <div>
                        <p className="font-medium">{discipline.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {discipline.slug} · {discipline.stream.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            discipline.isActive ? "success" : "secondary"
                          }
                        >
                          {discipline.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={discipline.isActive}
                          onCheckedChange={() => {
                            if (discipline.isActive) {
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
            </CardContent>
          </Card>
        )}

        {/* ── Study Levels ─────────────────────────────────────────── */}
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
                        <Badge
                          variant={level.isActive ? "success" : "secondary"}
                        >
                          {level.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={level.isActive}
                          onCheckedChange={() => {
                            if (level.isActive) {
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
            </CardContent>
          </Card>
        )}

        {/* ── Program Types ────────────────────────────────────────── */}
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
                        <Badge
                          variant={type.isActive ? "success" : "secondary"}
                        >
                          {type.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={type.isActive}
                          onCheckedChange={() => {
                            if (type.isActive) {
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
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
