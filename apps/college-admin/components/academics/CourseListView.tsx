"use client";

import { BookOpen, GraduationCap, Layers, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CourseListView({
  courses,
  onEdit,
  onDelete,
  onAddFirst,
}: {
  courses: any[];
  onEdit: (course: any) => void;
  onDelete: (id: string) => void;
  onAddFirst: () => void;
}) {
  if (courses.length === 0) {
    return (
      <Card className="border-dashed bg-muted/5 py-12">
        <CardContent className="flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-2">
            No programs configured
          </h3>
          <p className="text-muted-foreground max-w-sm mb-6 text-sm">
            Start building your academic catalog by configuring your first
            course offering.
          </p>
          <Button onClick={onAddFirst} size="lg" className="font-semibold">
            <Plus className="h-5 w-5 mr-2" /> Add First Course
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <Card
          key={course.id}
          className="group overflow-hidden border border-border/80 bg-card/60 backdrop-blur-md transition-all hover:shadow-lg hover:border-primary/40"
        >
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {course.code}
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-lg mb-1 line-clamp-1">
                {course.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                Study Mode: {course.studyMode?.replace("_", " ")}
              </p>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t">
              <p className="flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                {course.studyLevel?.name}
              </p>
              <p className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                {course.discipline?.name}
              </p>
              {course.campus && (
                <p className="text-primary font-semibold mt-2">
                  Campus: {course.campus.name}
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-4 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(course)}
              >
                Edit Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(course.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
