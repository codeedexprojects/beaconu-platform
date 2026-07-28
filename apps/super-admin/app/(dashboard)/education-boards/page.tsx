"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, Search, Plus, MoreHorizontal, Edit, X } from "lucide-react";
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
  name: string;
  max_mark: string;
  pass_mark: string;
}

interface BoardForm {
  name: string;
  grade: EducationBoardGrade;
  subjects: SubjectRow[];
}

const EMPTY_SUBJECT: SubjectRow = {
  name: "",
  max_mark: "100",
  pass_mark: "33",
};
const EMPTY_FORM: BoardForm = {
  name: "",
  grade: "10th",
  subjects: [{ ...EMPTY_SUBJECT }],
};

// Defined at module scope (not nested inside the page component) — a
// component defined inside another component's render body gets recreated
// as a new function identity on every render, which makes React treat it
// as an unrelated component type and remount it, dropping input focus
// after every keystroke.
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
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {subjects.map((subject, index) => (
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
              disabled={subjects.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
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
      name: s.name.trim(),
      max_mark: Number(s.max_mark),
      pass_mark: Number(s.pass_mark),
    }));
}

export default function EducationBoardsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useEducationBoards({
    search: search || undefined,
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
    setForm({ ...EMPTY_FORM, subjects: [{ ...EMPTY_SUBJECT }] });
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (board: EducationBoardItem) => {
    setEditingBoard(board);
    setForm({
      name: board.name,
      grade: board.grade,
      subjects: board.subjects.map((s) => ({
        name: s.name,
        max_mark: s.maxMark,
        pass_mark: s.passMark,
      })),
    });
    setIsEditModalOpen(true);
  };

  const addSubjectRow = () => {
    setForm((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { ...EMPTY_SUBJECT, name: "" }],
    }));
  };

  const removeSubjectRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }));
  };

  const updateSubjectRow = (
    index: number,
    field: keyof SubjectRow,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    }));
  };

  // Client-side pass_mark <= max_mark check for fast feedback — server
  // re-validates regardless.
  const subjectsInvalid = form.subjects.some((s) => {
    if (!s.name.trim()) return false;
    return Number(s.pass_mark) > Number(s.max_mark);
  });

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
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search education boards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
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
                            className="text-[10px] font-mono"
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

      {/* Create Modal Overlay */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Add Education Board</h3>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-name">Board Name</Label>
                    <Input
                      id="create-name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g. CBSE, ICSE, State Board"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-grade">Grade</Label>
                    <Select
                      value={form.grade}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          grade: value as EducationBoardGrade,
                        }))
                      }
                    >
                      <SelectTrigger id="create-grade">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10th">10th</SelectItem>
                        <SelectItem value="12th">12th</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SubjectRowsEditor
                  subjects={form.subjects}
                  subjectsInvalid={subjectsInvalid}
                  onAdd={addSubjectRow}
                  onRemove={removeSubjectRow}
                  onUpdate={updateSubjectRow}
                />
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
                  disabled={createMutation.isPending || subjectsInvalid}
                >
                  {createMutation.isPending ? "Creating..." : "Create Board"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Modal Overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Edit Education Board</h3>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Board Name</Label>
                    <Input
                      id="edit-name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g. CBSE, ICSE, State Board"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-grade">Grade</Label>
                    <Select
                      value={form.grade}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          grade: value as EducationBoardGrade,
                        }))
                      }
                    >
                      <SelectTrigger id="edit-grade">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10th">10th</SelectItem>
                        <SelectItem value="12th">12th</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SubjectRowsEditor
                  subjects={form.subjects}
                  subjectsInvalid={subjectsInvalid}
                  onAdd={addSubjectRow}
                  onRemove={removeSubjectRow}
                  onUpdate={updateSubjectRow}
                />
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
