"use client";

interface Agent {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  rating: number;
  perfScore: number;
  pricing: number;
  icon: string;
  tier: string;
  contextWindow?: number;
  latency?: number;
  successRate?: number;
  tokensPerSec?: number;
}

interface AgentCardProps {
  agent: any;
  isInCompare: boolean;
  isAdmin: boolean;
  onCompareToggle: (agent: any) => void;
  onEdit: (agent: any) => void;
  onDelete: (id: string) => void;
  onInteract: (agent: any) => void;
}

export default function AgentCard({
  agent,
  isInCompare,
  isAdmin,
  onCompareToggle,
  onEdit,
  onDelete,
  onInteract,
}: AgentCardProps) {
  const tierColors: Record<string, string> = {
    platinum: "bg-indigo-50 text-indigo-600 border-indigo-100",
    enterprise: "bg-purple-50 text-purple-600 border-purple-100",
    gold: "bg-amber-50 text-amber-600 border-amber-100",
    standard: "bg-slate-50 text-slate-500 border-slate-100",
  };

  return (
    <div className="air-card rounded-xl p-6 flex flex-col group">
      {/* top row */}
      <div className="flex justify-between items-start mb-5">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600">
          <span className="material-symbols-outlined text-[24px]">{agent.icon}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <span
            className="material-symbols-outlined text-[14px] text-amber-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="text-xs font-bold text-slate-700">{agent.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* name + provider */}
      <h3
        className="text-[17px] font-semibold text-slate-900 mb-0.5 leading-tight"
        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
      >
        {agent.name}
      </h3>
      <div className="flex items-center gap-2 mb-4">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          {agent.provider}
        </p>
        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
            tierColors[agent.tier] ?? tierColors.standard
          }`}
        >
          {agent.tier}
        </span>
      </div>

      {/* description */}
      <p className="text-sm text-slate-500 line-clamp-3 mb-auto leading-relaxed">
        {agent.description}
      </p>

      {/* bottom stats */}
      <div className="mt-5 pt-5 border-t border-slate-100">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter block mb-0.5">
              Perf Score
            </span>
            <span className="text-lg font-bold text-slate-900">{agent.perfScore.toFixed(1)}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter block mb-0.5">
              Pricing
            </span>
            <span className="text-sm font-semibold text-indigo-600">
              ${agent.pricing.toFixed(2)}<span className="text-slate-400 font-normal text-xs">/req</span>
            </span>
          </div>
        </div>

        {/* action buttons */}
        <div className="flex gap-2 items-center">
          <button
            id={`compare-btn-${agent.id}`}
            onClick={() => onCompareToggle(agent)}
            className={`flex-1 h-9 flex items-center justify-center rounded-lg text-xs font-semibold transition-all border ${
              isInCompare
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {isInCompare ? "✓ In Compare" : "Compare"}
          </button>

          <button
            id={`interact-btn-${agent.id}`}
            onClick={() => onInteract(agent)}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-200 shrink-0"
            title="Interact Sandbox"
          >
            <span className="material-symbols-outlined text-[18px]">forum</span>
          </button>

          {isAdmin && (
            <>
              <button
                id={`edit-btn-${agent.id}`}
                onClick={() => onEdit(agent)}
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-55 rounded-lg transition-all border border-slate-200 shrink-0"
                title="Edit agent"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                id={`delete-btn-${agent.id}`}
                onClick={() => onDelete(agent.id)}
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-slate-200 shrink-0"
                title="Delete agent"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
