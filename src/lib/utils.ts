export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return n.toString();
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    "Data & Analysis": "query_stats",
    "Content Creation": "edit_note",
    Development: "code",
    "Customer Ops": "support_agent",
  };
  return map[category] ?? "robot_2";
}

export function getTierColor(tier: string): string {
  const map: Record<string, string> = {
    platinum: "text-indigo-400",
    enterprise: "text-purple-500",
    gold: "text-amber-500",
    standard: "text-slate-500",
  };
  return map[tier] ?? "text-slate-500";
}
