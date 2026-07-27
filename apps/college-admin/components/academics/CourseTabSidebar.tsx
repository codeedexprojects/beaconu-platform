"use client";

import {
  COURSE_TABS,
  type CourseTabId,
} from "@/components/academics/constants";

export function CourseTabSidebar({
  activeTab,
  hasEditingCourse,
  onSelectTab,
}: {
  activeTab: CourseTabId;
  hasEditingCourse: boolean;
  onSelectTab: (tab: CourseTabId) => void;
}) {
  return (
    <aside className="lg:col-span-3 space-y-2">
      {COURSE_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isDisabled = !hasEditingCourse && tab.id !== "basic";

        return (
          <button
            key={tab.id}
            type="button"
            disabled={isDisabled}
            onClick={() => {
              onSelectTab(tab.id);
            }}
            className={`w-full flex flex-col items-start gap-1 p-4 rounded-xl text-left transition-all border ${
              isActive
                ? "bg-primary/5 border-primary/30 text-primary shadow-sm font-semibold ring-1 ring-primary/20"
                : isDisabled
                  ? "opacity-50 cursor-not-allowed border-transparent text-muted-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className="text-sm font-bold">{tab.label}</span>
            </div>
            <span className="text-xs text-muted-foreground/80 line-clamp-1 pl-8">
              {tab.desc}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
