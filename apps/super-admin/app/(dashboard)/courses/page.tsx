"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useColleges, useCollegeById } from "@/hooks/use-colleges";
import {
  BookOpen,
  Search,
  School,
  Calendar,
  Users,
  Award,
  MapPin,
} from "lucide-react";

export default function SuperAdminCoursesPage() {
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: collegesData, isLoading: isLoadingColleges } = useColleges({
    limit: 100,
  });
  const colleges = collegesData?.data || [];

  const { data: collegeDetail, isLoading: isLoadingDetail } =
    useCollegeById(selectedCollegeId);

  const filteredCourses = (collegeDetail?.courses || []).filter((course) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      course.name.toLowerCase().includes(searchLower) ||
      course.code.toLowerCase().includes(searchLower) ||
      course.discipline.name.toLowerCase().includes(searchLower) ||
      course.studyLevel.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col min-h-full bg-muted/10">
      <Header
        title="Courses Registry"
        description="Verify and browse courses, intake capacities, and academic taxonomy configurations registered by colleges."
      />

      <div className="space-y-6 p-6 max-w-7xl mx-auto w-full">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="space-y-1.5 w-full md:max-w-md">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Institution
              </span>
              <Select
                value={selectedCollegeId}
                onValueChange={setSelectedCollegeId}
              >
                <SelectTrigger className="w-full bg-background border-muted/50 h-11">
                  <SelectValue
                    placeholder={
                      isLoadingColleges
                        ? "Loading colleges..."
                        : "Choose a college..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCollegeId && (
              <div className="relative w-full md:max-w-xs space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block md:invisible">
                  Search
                </span>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-muted/50 h-11"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedCollegeId && isLoadingDetail && (
          <div className="grid gap-6">
            <div className="h-32 rounded-xl bg-card animate-pulse border border-muted/20" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-44 rounded-xl bg-card animate-pulse border border-muted/20"
                />
              ))}
            </div>
          </div>
        )}

        {selectedCollegeId && collegeDetail && !isLoadingDetail && (
          <div className="space-y-6">
            <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-r from-primary/5 via-transparent to-transparent border-l-4 border-primary">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-background border flex items-center justify-center shadow-sm shrink-0">
                      {collegeDetail.logoUrl ? (
                        <img
                          src={collegeDetail.logoUrl}
                          alt={collegeDetail.name}
                          className="h-12 w-12 object-contain"
                        />
                      ) : (
                        <School className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold tracking-tight">
                          {collegeDetail.name}
                        </h2>
                        <Badge
                          variant="outline"
                          className="border-primary/20 text-primary bg-primary/5"
                        >
                          {collegeDetail.code}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {collegeDetail.city
                          ? `${collegeDetail.city}, ${collegeDetail.state}`
                          : "Location pending"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6 self-stretch sm:self-center items-center justify-around sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-muted">
                    <div className="text-center sm:text-right">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                        Total Courses
                      </p>
                      <p className="text-2xl font-extrabold text-primary mt-0.5">
                        {collegeDetail.courses?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Active Offerings</h3>
                <p className="text-xs text-muted-foreground">
                  Showing {filteredCourses.length} of{" "}
                  {collegeDetail.courses?.length || 0} courses
                </p>
              </div>

              {filteredCourses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="border-0 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-0 font-medium"
                          >
                            {course.code}
                          </Badge>
                          <Badge
                            className="capitalize text-xs"
                            variant="outline"
                          >
                            {course.studyMode.replace("_", " ")}
                          </Badge>
                        </div>
                        <CardTitle className="text-base font-bold mt-2.5 line-clamp-1 leading-snug">
                          {course.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm pt-0">
                        <div className="space-y-2 border-t pt-3 border-muted/50">
                          <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Award className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                            <span className="font-medium text-foreground">
                              {course.studyLevel.name}
                            </span>
                            <span className="text-[10px]">·</span>
                            <span>{course.programType.name}</span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <BookOpen className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                            <span className="truncate text-foreground font-medium">
                              {course.discipline.name}
                            </span>
                          </div>

                          {course.intakeCapacity && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                              <Users className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                              <span>Intake Capacity: </span>
                              <span className="font-semibold text-foreground">
                                {course.intakeCapacity} seats
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-sm py-12 text-center">
                  <CardContent className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h4 className="font-semibold text-base">
                      No courses found
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      {searchQuery
                        ? "Try refining your search keyword or clearing the search box."
                        : "This college has not set up any courses yet."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Empty / Unselected State */}
        {!selectedCollegeId && (
          <Card className="border-0 shadow-sm py-16 text-center bg-gradient-to-b from-card to-background">
            <CardContent className="flex flex-col items-center max-w-md mx-auto">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-bold">Select a College to Begin</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Choose a registered college from the selection menu above to
                view, filter, and inspect their active academic courses, levels,
                and program structures.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
