"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
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
  ChevronRight,
  UserPlus,
  Inbox,
  Layers,
  Landmark,
  PlayCircle,
  Wallet,
  ReceiptIndianRupee,
  Award,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        href: "/university-types",
        label: "University Types",
        icon: GraduationCap,
        permission: "university-types.view",
      },
      {
        href: "/universities",
        label: "Universities",
        icon: GraduationCap,
        permission: "universities.view",
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
      {
        href: "/counsellors/withdrawals",
        label: "Withdrawal Requests",
        icon: Wallet,
        permission: "counsellors.view",
      },
      {
        href: "/counsellors/refund-requests",
        label: "Refund Requests",
        icon: ReceiptIndianRupee,
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
        href: "/education-boards",
        label: "Education Boards",
        icon: Award,
        permission: "education-boards.view",
      },
      {
        href: "/icons",
        label: "Icons",
        icon: ImageIcon,
        permission: "icons.view",
      },
      {
        href: "/financial-aid",
        label: "Financial Aid",
        icon: Landmark,
        permission: "content.view",
      },
      {
        href: "/events",
        label: "Events",
        icon: Calendar,
        permission: "events.view",
      },
      {
        href: "/starter-guide",
        label: "Starter Guide",
        icon: PlayCircle,
        permission: "content.view",
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
        href: "/blink/academic-counsellor-requests",
        label: "Academic Counsellor Requests",
        icon: GraduationCap,
        permission: "counsellors.view",
      },
      {
        href: "/blink/mindcare-counsellor-requests",
        label: "MindCare Counsellor Requests",
        icon: HeartHandshake,
        permission: "counsellors.view",
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

function getActiveHref(pathname: string): string | null {
  let best: string | null = null;
  for (const section of navSections) {
    for (const item of section.items) {
      const matches =
        item.href === "/"
          ? pathname === "/"
          : pathname === item.href || pathname.startsWith(item.href + "/");
      if (matches && (best === null || item.href.length > best.length)) {
        best = item.href;
      }
    }
  }
  return best;
}

export function Sidebar() {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);

  const admin = useAuthStore((state) => state.admin);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const initials =
    admin?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "A";

  function handleLogout() {
    clearAuth();
    window.location.assign("/login");
  }

  return (
    <aside className="flex h-screen w-72 flex-col bg-navy border-r border-transparent shrink-0">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-5 border-b border-navy-dark/50">
        <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white">
          <span className="text-sm font-bold text-navy-dark font-serif">B</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold text-white font-serif tracking-wide">
            BeaconU
          </span>
          <span className="text-[10px] text-gray-sidebar uppercase tracking-widest mt-1">
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
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-sidebar">
                  {section.label}
                </p>
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = item.href === activeHref;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out",
                            isActive
                              ? "bg-gold text-white"
                              : "text-gray-sidebar hover:bg-navy-dark hover:text-white border border-transparent",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors duration-200",
                              isActive
                                ? "text-white"
                                : "text-gray-sidebar group-hover:text-white",
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                          {isActive && (
                            <ChevronRight className="ml-auto h-3 w-3 opacity-80 animate-pulse" />
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

      {/* User Profile Footer */}
      <div className="p-4 border-t border-navy-dark/50">
        <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-navy-dark">
          <Avatar className="h-9 w-9 border border-navy-dark">
            <AvatarImage src={admin?.avatarUrl} />
            <AvatarFallback className="bg-navy-dark text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-sm font-medium text-white truncate">
              {admin?.fullName}
            </span>
            <span className="text-[11px] text-gray-sidebar truncate">
              {admin?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-sidebar hover:text-white rounded-md hover:bg-navy transition-colors"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
