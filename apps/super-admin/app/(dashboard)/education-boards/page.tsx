"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  X,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useEducationBoards,
  useCreateEducationBoard,
  useUpdateEducationBoard,
  useDeactivateEducationBoard,
  useActivateEducationBoard,
} from "@/hooks/use-education-boards";
import type { EducationBoardItem, EducationBoardGrade } from "@beaconu/types";

interface SubjectRow {
  course: string;
  name: string;
  max_mark: string;
  pass_mark: string;
}

interface BoardForm {
  name: string;
  grade: EducationBoardGrade;
  subjects: SubjectRow[];
  courseGroups: string[];
}

const EMPTY_SUBJECT: Omit<SubjectRow, "course"> = {
  name: "",
  max_mark: "100",
  pass_mark: "33",
};
const EMPTY_FORM: BoardForm = {
  name: "",
  grade: "10th",
  subjects: [{ ...EMPTY_SUBJECT, course: "" }],
  courseGroups: [],
};

const GRADE_BADGE_CLASS =
  "text-[10px] font-mono border-border bg-muted text-foreground";

function SubjectRowsEditor({
  subjects,
  subjectsInvalid,
  onAdd,
  onRemove,
  onUpdate,
}: {
  subjects: SubjectRow[];
  subjectsInvalid: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof SubjectRow, value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Subjects</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="h-7 gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Subject
        </Button>
      </div>
      {subjects.length > 0 && (
        <div className="flex items-center gap-2 px-0.5">
          <span className="flex-1 text-xs font-medium text-muted-foreground">
            Subject Name
          </span>
          <span className="w-20 text-xs font-medium text-muted-foreground">
            Max Mark
          </span>
          <span className="w-20 text-xs font-medium text-muted-foreground">
            Pass Mark
          </span>
          <span className="w-8 shrink-0" />
        </div>
      )}
      <div className="space-y-2 pr-1">
        {subjects.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No subjects yet — click Add Subject.
          </p>
        ) : (
          subjects.map((subject, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="e.g. Mathematics"
                value={subject.name}
                onChange={(e) => onUpdate(index, "name", e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="100"
                value={subject.max_mark}
                onChange={(e) => onUpdate(index, "max_mark", e.target.value)}
                className="w-20"
              />
              <Input
                type="number"
                placeholder="33"
                value={subject.pass_mark}
                onChange={(e) => onUpdate(index, "pass_mark", e.target.value)}
                className="w-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
      {subjectsInvalid && (
        <p className="text-sm text-destructive">
          Pass mark cannot exceed max mark for a subject.
        </p>
      )}
    </div>
  );
}

function toSubjectInputs(subjects: SubjectRow[]) {
  return subjects
    .filter((s) => s.name.trim().length > 0)
    .map((s) => ({
      course: s.course || undefined,
      name: s.name.trim(),
      max_mark: Number(s.max_mark),
      pass_mark: Number(s.pass_mark),
    }));
}

function isSubjectsInvalid(subjects: SubjectRow[]) {
  return subjects.some((s) => {
    if (!s.name.trim()) return false;
    return Number(s.pass_mark) > Number(s.max_mark);
  });
}

function BoardFormFields({
  form,
  setForm,
  idPrefix,
}: {
  form: BoardForm;
  setForm: React.Dispatch<React.SetStateAction<BoardForm>>;
  idPrefix: string;
}) {
  const [newCourseName, setNewCourseName] = useState("");

  function handleGradeChange(grade: EducationBoardGrade) {
    setForm((prev) => ({
      ...prev,
      grade,
      subjects: grade === "10th" ? [{ ...EMPTY_SUBJECT, course: "" }] : [],
      courseGroups: [],
    }));
  }

  function addCourseGroup() {
    const name = newCourseName.trim();
    if (!name) return;
    if (form.courseGroups.some((c) => c.toLowerCase() === name.toLowerCase())) {
      toast.error("That course is already added");
      return;
    }
    setForm((prev) => ({
      ...prev,
      courseGroups: [...prev.courseGroups, name],
    }));
    setNewCourseName("");
  }

  function removeCourseGroup(name: string) {
    setForm((prev) => ({
      ...prev,
      courseGroups: prev.courseGroups.filter((c) => c !== name),
      subjects: prev.subjects.filter((s) => s.course !== name),
    }));
  }

  function addSubjectRow(course: string) {
    setForm((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { ...EMPTY_SUBJECT, name: "", course }],
    }));
  }

  function removeSubjectRow(course: string, localIndex: number) {
    setForm((prev) => {
      let seen = -1;
      return {
        ...prev,
        subjects: prev.subjects.filter((s) => {
          if (s.course !== course) return true;
          seen += 1;
          return seen !== localIndex;
        }),
      };
    });
  }

  function updateSubjectRow(
    course: string,
    localIndex: number,
    field: keyof SubjectRow,
    value: string,
  ) {
    setForm((prev) => {
      let seen = -1;
      return {
        ...prev,
        subjects: prev.subjects.map((s) => {
          if (s.course !== course) return s;
          seen += 1;
          return seen === localIndex ? { ...s, [field]: value } : s;
        }),
      };
    });
  }

  const subjectsInvalid = isSubjectsInvalid(form.subjects);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-name`}>Board Name</Label>
          <Input
            id={`${idPrefix}-name`}
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g. CBSE, ICSE, State Board"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-grade`}>Grade</Label>
          <Select value={form.grade} onValueChange={handleGradeChange}>
            <SelectTrigger id={`${idPrefix}-grade`}>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10th">10th</SelectItem>
              <SelectItem value="12th">12th</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {form.grade === "10th" ? (
        <SubjectRowsEditor
          subjects={form.subjects}
          subjectsInvalid={subjectsInvalid}
          onAdd={() => addSubjectRow("")}
          onRemove={(index) => removeSubjectRow("", index)}
          onUpdate={(index, field, value) =>
            updateSubjectRow("", index, field, value)
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Courses</Label>
            <p className="text-xs text-muted-foreground">
              Select a course/stream (e.g. Science, Commerce), then add its
              subjects below.
            </p>
            <div className="flex items-center gap-2">
              <Input
                placeholder="e.g. Science"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCourseGroup();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCourseGroup}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Course
              </Button>
            </div>
          </div>

          {form.courseGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a course above to start adding its subjects.
            </p>
          ) : (
            <div className="space-y-4">
              {form.courseGroups.map((course) => {
                const courseSubjects = form.subjects.filter(
                  (s) => s.course === course,
                );
                return (
                  <div key={course} className="space-y-3 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{course}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeCourseGroup(course)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <SubjectRowsEditor
                      subjects={courseSubjects}
                      subjectsInvalid={isSubjectsInvalid(courseSubjects)}
                      onAdd={() => addSubjectRow(course)}
                      onRemove={(index) => removeSubjectRow(course, index)}
                      onUpdate={(index, field, value) =>
                        updateSubjectRow(course, index, field, value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EducationBoardsPage() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  const { data, isLoading } = useEducationBoards({
    search: search || undefined,
    grade: gradeFilter === "all" ? undefined : gradeFilter,
    limit: 100,
  });
  const boards = data?.data ?? [];
  const meta = data?.meta;
  const createMutation = useCreateEducationBoard();
  const updateMutation = useUpdateEducationBoard();
  const deactivateMutation = useDeactivateEducationBoard();
  const activateMutation = useActivateEducationBoard();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<EducationBoardItem | null>(
    null,
  );
  const [form, setForm] = useState<BoardForm>(EMPTY_FORM);

  const handleToggleStatus = (board: EducationBoardItem) => {
    if (board.isActive) {
      deactivateMutation.mutate(board.id, {
        onSuccess: () => toast.success("Board deactivated successfully"),
      });
    } else {
      activateMutation.mutate(board.id, {
        onSuccess: () => toast.success("Board activated successfully"),
      });
    }
  };

  const handleCreateClick = () => {
    setForm({
      ...EMPTY_FORM,
      subjects: [{ ...EMPTY_SUBJECT, course: "" }],
    });
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (board: EducationBoardItem) => {
    setEditingBoard(board);
    const subjects = board.subjects.map((s) => ({
      course: s.course,
      name: s.name,
      max_mark: s.maxMark,
      pass_mark: s.passMark,
    }));
    const courseGroups =
      board.grade === "12th"
        ? Array.from(new Set(subjects.map((s) => s.course).filter(Boolean)))
        : [];
    setForm({
      name: board.name,
      grade: board.grade,
      subjects,
      courseGroups,
    });
    setIsEditModalOpen(true);
  };

  const subjectsInvalid = isSubjectsInvalid(form.subjects);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        name: form.name,
        grade: form.grade,
        subjects: toSubjectInputs(form.subjects),
      },
      {
        onSuccess: () => {
          toast.success("Education board created successfully");
          setIsCreateModalOpen(false);
        },
      },
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoard) return;
    updateMutation.mutate(
      {
        id: editingBoard.id,
        data: {
          name: form.name,
          grade: form.grade,
          subjects: toSubjectInputs(form.subjects),
        },
      },
      {
        onSuccess: () => {
          toast.success("Education board updated successfully");
          setIsEditModalOpen(false);
        },
      },
    );
  };

  const activeCount = boards.filter((b) => b.isActive).length;

  return (
    <div className="flex flex-col min-h-full relative">
      <Header
        title="Education Boards"
        description="Manage education boards, grades, and subject-wise marks"
      >
        <Button className="gap-2" onClick={handleCreateClick}>
          <Plus className="h-4 w-4" />
          Add Board
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search education boards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="All grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="10th">10th</SelectItem>
                <SelectItem value="12th">12th</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="info" className="px-3 py-1 gap-1.5">
            {activeCount}/{boards.length} Active
          </Badge>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground font-medium">
                  Loading education boards...
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[250px]">Name</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Subjects</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boards.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No education boards found
                      </TableCell>
                    </TableRow>
                  ) : (
                    boards.map((board) => (
                      <TableRow
                        key={board.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <p className="font-semibold text-sm">
                              {board.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className={GRADE_BADGE_CLASS}
                          >
                            {board.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium">
                          {board.subjects.length} subject
                          {board.subjects.length === 1 ? "" : "s"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Switch
                              checked={board.isActive}
                              onCheckedChange={() => handleToggleStatus(board)}
                            />
                            {board.isActive ? (
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
                                onClick={() => handleEditClick(board)}
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
            Showing {boards.length} of {meta.total} education boards
          </p>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h3 className="font-semibold text-lg">Add Education Board</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form
              onSubmit={handleCreate}
              className="flex flex-col overflow-hidden"
            >
              <CardContent className="p-6 overflow-y-auto">
                <BoardFormFields
                  form={form}
                  setForm={setForm}
                  idPrefix="create"
                />
              </CardContent>
              <div className="flex justify-end gap-2 p-4 border-t bg-muted/20 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || subjectsInvalid}
                >
                  {createMutation.isPending ? "Creating..." : "Create Board"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h3 className="font-semibold text-lg">Edit Education Board</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form
              onSubmit={handleUpdate}
              className="flex flex-col overflow-hidden"
            >
              <CardContent className="p-6 overflow-y-auto">
                <BoardFormFields
                  form={form}
                  setForm={setForm}
                  idPrefix="edit"
                />
              </CardContent>
              <div className="flex justify-end gap-2 p-4 border-t bg-muted/20 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || subjectsInvalid}
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
