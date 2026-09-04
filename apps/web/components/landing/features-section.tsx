import {
  GraduationCap,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Trophy,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: GraduationCap,
    title: "Student Portal",
    desc: "Personalized dashboards, attendance tracking, and academic progress in one place.",
  },
  {
    icon: ClipboardList,
    title: "Admissions Management",
    desc: "Streamlined application workflows from inquiry to enrollment with smart automation.",
  },
  {
    icon: MessageSquare,
    title: "Community Hub",
    desc: "Connect students, faculty, and alumni through discussion boards and messaging.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Real-time insights on student performance, engagement, and campus operations.",
  },
  {
    icon: Trophy,
    title: "Events & Competitions",
    desc: "Manage campus events, hackathons, and cultural fests with built-in ticketing.",
  },
  {
    icon: Briefcase,
    title: "Career Services",
    desc: "Placement tracking, job boards, and alumni network to boost student outcomes.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="solutions"
      className="mx-auto max-w-[1100px] scroll-mt-20 px-6 py-24"
    >
      <p className="text-center text-xs font-bold uppercase tracking-[0.12em] text-landing">
        Why BeaconU
      </p>
      <h2 className="mx-auto mt-3 max-w-2xl text-center font-sans text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight tracking-tight text-navy-dark">
        Everything your campus needs
      </h2>
      <p className="mx-auto mb-12 mt-4 max-w-[500px] text-center text-base text-gray-label">
        A unified platform built for modern Indian higher education
        institutions.
      </p>
      <div className="grid grid-cols-1 gap-6 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group rounded-2xl border border-black/5 bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-1 hover:border-landing/30 hover:shadow-[0_16px_40px_rgba(244,106,18,0.14)]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-landing/10 text-landing transition-colors group-hover:bg-landing">
              <Icon
                className="h-5 w-5 text-landing transition-colors group-hover:text-white"
                strokeWidth={2}
              />
            </div>
            <div className="mb-2 text-base font-bold text-navy-dark">
              {title}
            </div>
            <div className="text-sm leading-relaxed text-gray-label">
              {desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
