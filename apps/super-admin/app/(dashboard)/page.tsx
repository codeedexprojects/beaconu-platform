"use client";

import React, { useState } from "react";
import {
  Building2,
  Users,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  Target,
  Sparkles,
  Activity,
  CheckCircle2,
  Plus,
  ArrowRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

// Mock Data
const stats = [
  {
    label: "Total Colleges",
    value: 248,
    change: +12,
    icon: Building2,
    progress: 74,
    accent: "text-rose-600",
    color: "rgba(179, 27, 77, 0.15)",
  },
  {
    label: "Total Students",
    value: 94312,
    change: +8.4,
    icon: Users,
    progress: 88,
    accent: "text-blue-600",
    color: "rgba(37, 99, 235, 0.15)",
  },
  {
    label: "Applications",
    value: 18540,
    change: +22.1,
    icon: FileText,
    progress: 61,
    accent: "text-emerald-600",
    color: "rgba(5, 150, 105, 0.15)",
  },
  {
    label: "Active Leads",
    value: 5891,
    change: -3.2,
    icon: Target,
    progress: 45,
    accent: "text-amber-600",
    color: "rgba(217, 119, 6, 0.15)",
  },
];

const recentColleges = [
  {
    name: "Amity University",
    city: "Noida, UP",
    type: "Deemed University",
    courses: 42,
    students: 1240,
    status: "active",
    logoText: "AU",
  },
  {
    name: "University of Hyderabad",
    city: "Hyderabad, TG",
    type: "Central University",
    courses: 38,
    students: 980,
    status: "active",
    logoText: "UH",
  },
  {
    name: "IIT Bombay",
    city: "Mumbai, MH",
    type: "INI",
    courses: 56,
    students: 2100,
    status: "active",
    logoText: "IIT",
  },
  {
    name: "Christ University",
    city: "Bengaluru, KA",
    type: "Deemed University",
    courses: 29,
    students: 760,
    status: "active",
    logoText: "CU",
  },
];

const recentLeads = [
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    stream: "Engineering",
    status: "new",
    time: "10m ago",
  },
  {
    name: "Rohan Mehta",
    email: "rohan@example.com",
    stream: "Commerce",
    status: "contacted",
    time: "45m ago",
  },
  {
    name: "Aisha Khan",
    email: "aisha@example.com",
    stream: "Medicine",
    status: "new",
    time: "2h ago",
  },
  {
    name: "Dev Patel",
    email: "dev@example.com",
    stream: "Law",
    status: "qualified",
    time: "5h ago",
  },
];

export default function DashboardPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredColleges = recentColleges.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-full pb-10">
      {/* Top Main Header */}
      <Header title="Dashboard" description="Platform-wide overview" />

      <div className="flex-1 space-y-8 p-6 max-w-7xl mx-auto w-full">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/10 bg-gradient-to-br from-white/80 via-white/40 to-rose-50/20 p-6 md:p-8 shadow-sm backdrop-blur-md">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-rose-500/5 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-100">
                <Sparkles className="h-3 w-3" />
                Version 1.2 Active
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                Welcome to Control Center
              </h2>
              <p className="text-slate-500 text-sm max-w-xl">
                Monitor campus admissions, student workflows, counsellor
                schedules, and performance metrics across the entire platform
                ecosystem.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 border border-emerald-100">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-medium text-emerald-800">
                  All Systems Operational
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Circular Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const isUp = stat.change >= 0;
            return (
              <Card key={stat.label} className="group relative overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        {stat.label}
                      </p>
                      <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {formatNumber(stat.value)}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          isUp ? "text-emerald-600" : "text-rose-500"
                        }`}
                      >
                        {isUp ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        {Math.abs(stat.change)}% this month
                      </span>
                    </div>

                    {/* Progress Circle Visualizer */}
                    <div className="relative flex items-center justify-center">
                      <svg className="h-16 w-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke="rgba(0, 0, 0, 0.04)"
                          strokeWidth="4"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke="rgba(179, 27, 77, 0.7)"
                          strokeWidth="4.5"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 26}
                          strokeDashoffset={
                            2 * Math.PI * 26 * (1 - stat.progress / 100)
                          }
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div
                        className="absolute flex items-center justify-center rounded-full h-10 w-10"
                        style={{ backgroundColor: stat.color }}
                      >
                        <stat.icon className={`h-4.5 w-4.5 ${stat.accent}`} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content Layout Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Onboarding Feed Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Institutional Partners
                </h3>
                <p className="text-xs text-slate-500">
                  Onboarded universities and colleges
                </p>
              </div>

              {/* Advanced Search & Filtering bar */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search campus..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                >
                  <SlidersHorizontal className="h-4 w-4 text-slate-600" />
                </Button>
              </div>
            </div>

            {/* Premium Institutional Cards Layout */}
            <div className="grid gap-4">
              {filteredColleges.length === 0 ? (
                <Card className="p-8 text-center flex flex-col items-center justify-center gap-2 border border-slate-100 bg-slate-50/50">
                  <Building2 className="h-10 w-10 text-slate-300" />
                  <p className="text-sm text-slate-500 font-medium">
                    No matching colleges found
                  </p>
                </Card>
              ) : (
                filteredColleges.map((college) => (
                  <div
                    key={college.name}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/60 bg-white/40 p-4 shadow-sm backdrop-blur-md hover:border-rose-500/30 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center font-bold text-rose-700 shrink-0 border border-rose-200/50">
                        {college.logoText}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-slate-800 truncate">
                            {college.name}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0"
                          >
                            {college.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {college.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-400">Total Courses</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {college.courses} Stream Lines
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-400">Enrollments</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {formatNumber(college.students)} Students
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            college.status === "active"
                              ? "success"
                              : "secondary"
                          }
                          className="text-[9px] uppercase tracking-wider font-semibold"
                        >
                          {college.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Snapshots & Leads */}
          <div className="space-y-6">
            {/* Quick Metrics Snapshots */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100/50">
                <CardTitle className="text-sm font-bold text-slate-800">
                  Platform Snapshots
                </CardTitle>
                <CardDescription>Overall active indicators</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3.5">
                {[
                  {
                    label: "University Groups",
                    value: 18,
                    icon: GraduationCap,
                    progress: 60,
                  },
                  {
                    label: "Active Counsellors",
                    value: 94,
                    icon: Users,
                    progress: 85,
                  },
                  {
                    label: "Events this month",
                    value: 12,
                    icon: TrendingUp,
                    progress: 40,
                  },
                  {
                    label: "Pending Blogs",
                    value: 7,
                    icon: FileText,
                    progress: 25,
                  },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-50 border border-slate-100">
                          <item.icon className="h-3 w-3 text-slate-500" />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        {item.value}
                      </span>
                    </div>
                    {/* Linear glass progress bar */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-600/70 rounded-full transition-all duration-1000"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions Panel */}
            <Card className="border border-rose-500/10 bg-gradient-to-tr from-rose-50/10 to-rose-100/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-rose-800">
                  Quick Actions
                </CardTitle>
                <CardDescription>Shortcut controls</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs hover:border-rose-500/40 hover:text-rose-700"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add College
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs hover:border-rose-500/40 hover:text-rose-700"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  New Event
                </Button>
              </CardContent>
            </Card>

            {/* Recent Leads Pipeline */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-800">
                      Recent Leads
                    </CardTitle>
                    <CardDescription>Awaiting assignment</CardDescription>
                  </div>
                  <Activity className="h-4 w-4 text-rose-500 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.email}
                    className="flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs font-bold">
                        {lead.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-rose-600 transition-colors">
                          {lead.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {lead.stream} · {lead.time}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        lead.status === "new"
                          ? "orange"
                          : lead.status === "qualified"
                            ? "success"
                            : "secondary"
                      }
                      className="text-[9px] shrink-0 uppercase tracking-wide"
                    >
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
