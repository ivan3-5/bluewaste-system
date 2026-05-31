import { CheckCircle2, Clock3, FileText, RefreshCw } from "lucide-react";
import type { ComponentType } from "react";

type StatsCardsProps = {
  totalReports: number;
  pendingCount: number;
  inProgressCount: number;
  cleanedCount: number;
};

const cards = [
  {
    key: "totalReports",
    label: "Total Reports",
    caption: "All submitted reports",
    icon: FileText,
    gradient: "from-sky-500 to-blue-600",
  },
  {
    key: "pendingCount",
    label: "Pending",
    caption: "Needs review",
    icon: Clock3,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    key: "inProgressCount",
    label: "In Progress",
    caption: "Currently being handled",
    icon: RefreshCw,
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    key: "cleanedCount",
    label: "Cleaned",
    caption: "Successfully resolved",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-lime-500",
  },
] satisfies readonly {
  key: keyof StatsCardsProps;
  label: string;
  caption: string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
}[];

export function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg`}
          >
            <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/20" />
            <div className="pointer-events-none absolute -bottom-16 -right-6 h-36 w-36 rounded-full bg-white/12" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white/90">
                {card.label}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/15">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-6 text-4xl font-black tracking-tight">
              {props[card.key]}
            </p>
            <p className="mt-1 text-sm text-white/85">{card.caption}</p>
          </div>
        );
      })}
    </div>
  );
}
