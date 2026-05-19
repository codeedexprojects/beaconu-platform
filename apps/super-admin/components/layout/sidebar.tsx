"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  Target,
  HeartHandshake,
  FileText,
  BookOpen,
  Newspaper,
  PenLine,
  Calendar,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  UserPlus,
  Inbox,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  permission?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Institutions",
    items: [
      {
        href: "/colleges",
        label: "Colleges",
        icon: Building2,
        permission: "colleges.view",
      },
      {
        href: "/universities",
        label: "Universities",
        icon: GraduationCap,
        permission: "universities.view",
      },
      {
        href: "/university-types",
        label: "University Types",
        icon: GraduationCap,
        permission: "university-types.view",
      },
      {
        href: "/academic-masters",
        label: "Academic Masters",
        icon: Layers,
        permission: "academic-masters.view",
      },
      {
        href: "/courses",
        label: "Courses",
        icon: BookOpen,
        permission: "academic-masters.view",
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        href: "/students",
        label: "Students",
        icon: Users,
        permission: "students.view",
      },
      {
        href: "/student-leads",
        label: "Student Leads",
        icon: Target,
        permission: "leads.view",
      },
      {
        href: "/counsellors",
        label: "Counsellors",
        icon: HeartHandshake,
        permission: "counsellors.view",
      },
    ],
  },
  {
    label: "Leads",
    items: [
      {
        href: "/leads/college-leads",
        label: "College Leads",
        icon: Inbox,
        permission: "leads.view",
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        href: "/blogs",
        label: "Blogs",
        icon: FileText,
        permission: "content.view",
      },
      {
        href: "/articles",
        label: "Articles",
        icon: BookOpen,
        permission: "content.view",
      },
      {
        href: "/news-alerts",
        label: "News & Alerts",
        icon: Newspaper,
        permission: "content.view",
      },
      {
        href: "/entrance-exams",
        label: "Entrance Exams",
        icon: PenLine,
        permission: "exams.view",
      },
      {
        href: "/events",
        label: "Events",
        icon: Calendar,
        permission: "events.view",
      },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        href: "/platform-admins",
        label: "Platform Staff",
        icon: ShieldCheck,
        permission: "platform.admins.view",
      },
      {
        href: "/roles",
        label: "Platform Roles",
        icon: ShieldCheck,
        permission: "platform.roles.view",
      },
      {
        href: "/settings",
        label: "System Settings",
        icon: Settings,
        permission: "platform.settings.view",
      },
    ],
  },
  {
    label: "Blink",
    items: [
      {
        href: "/blink/requests",
        label: "Registration Requests",
        icon: UserPlus,
        permission: "platform.admins.manage",
      },
      {
        href: "/blink/users",
        label: "Blink Users",
        icon: Users,
        permission: "platform.admins.view",
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { admin, clearAuth } = useAuthStore();

  function handleLogout() {
    clearAuth();
    window.location.assign("/login");
  }

  return (
    <aside className="flex h-screen w-60 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
          <span className="text-sm font-bold text-white">B</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold text-white tracking-wide">
            BeaconU
          </span>
          <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">
            Super Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-5 px-3">
          {navSections.map((section) => {
            const visibleItems = section.items;

            return (
              <div key={section.label}>
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                  {section.label}
                </p>
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname === item.href ||
                          pathname.startsWith(item.href + "/");
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150",
                            isActive
                              ? "bg-primary text-white shadow-sm shadow-primary/20"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isActive
                                ? "text-white"
                                : "text-sidebar-foreground/60 group-hover:text-white",
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                          {isActive && (
                            <ChevronRight className="ml-auto h-3 w-3 opacity-60" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User footer */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
            {admin?.fullName?.charAt(0) ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {admin?.fullName ?? "Admin"}
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/50 capitalize">
              {admin?.role?.replace("_", " ")}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 rounded-md p-1.5 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
