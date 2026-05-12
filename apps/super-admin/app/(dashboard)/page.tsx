import {
  Building2,
  Users,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  Target,
  MoreHorizontal,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";

const stats = [
  {
    label: "Total Colleges",
    value: 248,
    change: +12,
    icon: Building2,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    label: "Total Students",
    value: 94_312,
    change: +8.4,
    icon: Users,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    label: "Applications",
    value: 18_540,
    change: +22.1,
    icon: FileText,
    color: "text-primary",
    bg: "bg-orange-50",
  },
  {
    label: "Active Leads",
    value: 5_891,
    change: -3.2,
    icon: Target,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
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
  },
  {
    name: "University of Hyderabad",
    city: "Hyderabad, TG",
    type: "Central University",
    courses: 38,
    students: 980,
    status: "active",
  },
  {
    name: "IIT Bombay",
    city: "Mumbai, MH",
    type: "INI",
    courses: 56,
    students: 2100,
    status: "active",
  },
  {
    name: "Christ University",
    city: "Bengaluru, KA",
    type: "Deemed University",
    courses: 29,
    students: 760,
    status: "active",
  },
  {
    name: "Manipal Academy",
    city: "Manipal, KA",
    type: "Deemed University",
    courses: 61,
    students: 1820,
    status: "inactive",
  },
];

const recentLeads = [
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    stream: "Engineering",
    status: "new",
  },
  {
    name: "Rohan Mehta",
    email: "rohan@example.com",
    stream: "Commerce",
    status: "contacted",
  },
  {
    name: "Aisha Khan",
    email: "aisha@example.com",
    stream: "Medicine",
    status: "new",
  },
  {
    name: "Dev Patel",
    email: "dev@example.com",
    stream: "Law",
    status: "qualified",
  },
];

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="flex flex-col min-h-full">
      <Header title="Dashboard" description="Platform-wide overview" />

      <div className="flex-1 space-y-6 p-6">
        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const isUp = stat.change >= 0;
            return (
              <Card key={stat.label} className="relative overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatNumber(stat.value)}
                      </p>
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-medium ${isUp ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {isUp ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        {Math.abs(stat.change)}% this month
                      </div>
                    </div>
                    <div className={`rounded-xl ${stat.bg} p-3`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
                {/* Accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 to-primary/0" />
              </Card>
            );
          })}
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colleges table */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Recent Colleges</CardTitle>
                <CardDescription className="mt-1">
                  Latest onboarded institutions
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary text-xs"
              >
                View all <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Courses</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentColleges.map((college) => (
                    <TableRow key={college.name} className="cursor-pointer">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{college.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {college.city}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info" className="text-[10px]">
                          {college.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {college.courses}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatNumber(college.students)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            college.status === "active"
                              ? "success"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {college.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Quick stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Platform Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    label: "University Groups",
                    value: 18,
                    icon: GraduationCap,
                  },
                  { label: "Active Counsellors", value: 94, icon: Users },
                  { label: "Events this month", value: 12, icon: TrendingUp },
                  { label: "Pending Blogs", value: 7, icon: FileText },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                        <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent leads */}
            <Card className="flex-1">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle>Recent Leads</CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.email} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {lead.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.stream}
                      </p>
                    </div>
                    <Badge
                      variant={
                        lead.status === "new"
                          ? "orange"
                          : lead.status === "qualified"
                            ? "success"
                            : "secondary"
                      }
                      className="text-[10px] shrink-0"
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
