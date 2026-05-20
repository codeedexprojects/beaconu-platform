import {
  Headphones,
  CalendarDays,
  Users,
  Building2,
  Calculator,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Service {
  id: number;
  name: string;
  icon: LucideIcon;
  color: string;
}

const services: Service[] = [
  { id: 1, name: "Academic counselling", icon: Headphones, color: "#3B82F6" },
  { id: 2, name: "Events", icon: CalendarDays, color: "#8B5CF6" },
  { id: 3, name: "Community", icon: Users, color: "#EC4899" },
  { id: 4, name: "Compare colleges", icon: Building2, color: "#10B981" },
  { id: 5, name: "Loan calculator", icon: Calculator, color: "#F97316" },
];

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <button className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 w-full text-left">
      <span className="text-[14px] font-semibold text-[#111827] leading-tight pr-2">
        {service.name}
      </span>
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${service.color}18` }}
      >
        <Icon
          className="h-5 w-5"
          style={{ color: service.color }}
          strokeWidth={1.8}
        />
      </div>
    </button>
  );
}

export function StudentSupportServices() {
  return (
    <section className="px-4">
      <h2 className="text-[17px] font-bold text-[#111827] mb-3">
        Student Support Services
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}
