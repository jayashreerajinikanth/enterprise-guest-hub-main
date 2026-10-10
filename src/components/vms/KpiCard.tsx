import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  tone?: "primary" | "success" | "warning" | "info" | "destructive";
}

const toneBar: Record<string, string> = {
  primary: "bg-[#0A6ED1]",
  success: "bg-[#107E3E]",
  warning: "bg-[#F0AB00]",
  info: "bg-[#0A6ED1]",
  destructive: "bg-[#BB0000]",
};

const toneIcon: Record<string, string> = {
  primary: "text-[#0A6ED1]",
  success: "text-[#107E3E]",
  warning: "text-[#F0AB00]",
  info: "text-[#0A6ED1]",
  destructive: "text-[#BB0000]",
};

export function KpiCard({ label, value, icon: Icon, trend, tone = "primary" }: Props) {
  return (
    <div className="bg-card border border-border rounded-[3px] overflow-hidden">
      <div className={`h-1 ${toneBar[tone]}`} />
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</div>
          <Icon className={`h-4 w-4 ${toneIcon[tone]}`} />
        </div>
        <div className="mt-1 text-2xl font-bold text-foreground tabular-nums">{value}</div>
        {typeof trend === "number" && (
          <div className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium ${trend >= 0 ? "text-[#107E3E]" : "text-[#BB0000]"}`}>
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}% vs yesterday
          </div>
        )}
      </div>
    </div>
  );
}
