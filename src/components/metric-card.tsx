import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  featured?: boolean;
  color?: "blue" | "green" | "purple" | "orange";
};

const colors = {
  blue: "bg-blue-50 text-primary",
  green: "bg-emerald-50 text-emerald-600",
  purple: "bg-violet-50 text-violet-600",
  orange: "bg-amber-50 text-amber-600"
};

export function MetricCard({ label, value, trend, icon: Icon, featured = false, color = "blue" }: MetricCardProps) {
  return (
    <Card className={featured ? "navy-panel p-5 text-white shadow-soft" : "p-5 shadow-soft"}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={featured ? "text-sm font-semibold text-white/80" : "text-sm font-medium text-muted-foreground"}>
            {label}
          </p>
          <p className={featured ? "mt-3 text-2xl font-black text-white" : "mt-3 text-2xl font-black text-navy"}>
            {value}
          </p>
        </div>
        <div className={featured ? "grid h-11 w-11 place-items-center rounded-lg bg-white/12 text-white" : `grid h-11 w-11 place-items-center rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className={featured ? "mt-4 text-sm font-bold text-emerald-200" : "mt-4 text-sm font-bold text-emerald-600"}>
        {trend}
      </p>
    </Card>
  );
}
