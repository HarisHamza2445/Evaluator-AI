"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Agent {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  rating: number;
  perfScore: number;
  pricing: number;
  contextWindow: number;
  latency: number;
  successRate: number;
  tokensPerSec: number;
  icon: string;
  tier: string;
}

export default function ComparisonPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selected, setSelected] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => {
        setAgents(data);
        // restore from localStorage
        const stored = localStorage.getItem("compareList");
        if (stored) {
          const ids: Agent[] = JSON.parse(stored);
          const matched = ids
            .map((s) => data.find((a: Agent) => a.id === s.id))
            .filter(Boolean) as Agent[];
          setSelected(matched.slice(0, 3));
        }
        setLoading(false);
      });
  }, []);

  function toggleSelect(agent: Agent) {
    setSelected((prev) => {
      const already = prev.find((a) => a.id === agent.id);
      const next = already ? prev.filter((a) => a.id !== agent.id) : [...prev, agent].slice(0, 3);
      localStorage.setItem("compareList", JSON.stringify(next));
      return next;
    });
  }

  async function saveComparison() {
    if (selected.length < 2) return;
    setSaving(true);
    await fetch("/api/comparisons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentIds: selected.map((a) => a.id) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function exportAsJSON() {
    if (selected.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selected, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `evaluator-ai-comparison-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function exportAsPDF() {
    window.print();
  }

  // Build radar data — normalize all metrics to 0-100 scale
  function buildRadarData() {
    return [
      { axis: "Performance", ...Object.fromEntries(selected.map((a) => [a.name, a.perfScore])) },
      { axis: "Success Rate", ...Object.fromEntries(selected.map((a) => [a.name, a.successRate])) },
      { axis: "Speed", ...Object.fromEntries(selected.map((a) => [a.name, Math.max(0, 100 - a.latency / 20)])) },
      { axis: "Rating", ...Object.fromEntries(selected.map((a) => [a.name, a.rating * 20])) },
      { axis: "Throughput", ...Object.fromEntries(selected.map((a) => [a.name, Math.min(100, a.tokensPerSec / 10)])) },
    ];
  }

  const COLORS = ["#4338ca", "#006a61", "#d97706"];

  const specRows = [
    { label: "Performance Score", key: "perfScore", format: (v: number) => v.toFixed(1) },
    { label: "Context Window", key: "contextWindow", format: (v: number) => `${(v / 1000).toFixed(0)}k tokens` },
    { label: "Avg Latency", key: "latency", format: (v: number) => `${v}ms` },
    { label: "Success Rate", key: "successRate", format: (v: number) => `${v}%` },
    { label: "Tokens / sec", key: "tokensPerSec", format: (v: number) => v.toString() },
    { label: "Pricing", key: "pricing", format: (v: number) => `$${v.toFixed(3)}/req` },
    { label: "Rating", key: "rating", format: (v: number) => `${v.toFixed(1)} ★` },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          nav, header, aside, footer, button, #export-btn, #save-comparison-btn, .no-print, [id^="select-"], .agent-selector-section {
            display: none !important;
          }
          body, main {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .printable-matrix-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
      `}} />

      <Header title="Comparison" placeholder="Search agents or benchmarks..." />

      <div className="p-16 max-w-[1300px] mx-auto space-y-12 printable-matrix-container">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Comparison Matrix
            </h2>
            <p className="text-slate-500 mt-1">Select up to 3 agents below to compare them side by side.</p>
          </div>
          <div className="flex gap-3 no-print">
            <div className="relative">
              <button
                id="export-btn"
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">share</span> Export
              </button>
              
              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1.5 animate-slide-in-up">
                  <button
                    onClick={() => {
                      exportAsJSON();
                      setShowExportOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Download raw JSON
                  </button>
                  <button
                    onClick={() => {
                      exportAsPDF();
                      setShowExportOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                    Print comparative PDF
                  </button>
                </div>
              )}
            </div>

            <button
              id="save-comparison-btn"
              onClick={saveComparison}
              disabled={selected.length < 2 || saving}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {saved ? "check_circle" : "save"}
              </span>
              {saving ? "Saving..." : saved ? "Saved!" : "Save Comparison"}
            </button>
          </div>
        </div>

        {/* Agent selector */}
        <section className="agent-selector-section">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Select Agents to Compare ({selected.length}/3)
          </p>
          {loading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {agents.map((agent) => {
                const isSelected = !!selected.find((a) => a.id === agent.id);
                return (
                  <button
                    key={agent.id}
                    id={`select-${agent.id}`}
                    onClick={() => toggleSelect(agent)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{agent.icon}</span>
                    {agent.name}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {selected.length === 0 ? (
          <div className="text-center py-24 premium-card rounded-2xl">
            <span className="material-symbols-outlined text-slate-200 text-7xl block mb-4">compare_arrows</span>
            <p className="text-slate-500 font-medium">Pick at least 2 agents to start comparing</p>
          </div>
        ) : (
          <>
            {/* Bento — radar + agent cards */}
            <div className="grid grid-cols-12 gap-6">
              {/* Radar chart */}
              <div className="col-span-12 lg:col-span-5 premium-card p-8 rounded-2xl flex flex-col">
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                    Benchmark Analysis
                  </p>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={buildRadarData()}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis
                        dataKey="axis"
                        tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                      />
                      {selected.map((agent, i) => (
                        <Radar
                          key={agent.id}
                          name={agent.name}
                          dataKey={agent.name}
                          stroke={COLORS[i]}
                          fill={COLORS[i]}
                          fillOpacity={0.08}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                      <Legend
                        wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Agent cards */}
              <div className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                {selected.map((agent, i) => (
                  <div
                    key={agent.id}
                    className="premium-card p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center border"
                        style={{
                          backgroundColor: `${COLORS[i]}10`,
                          borderColor: `${COLORS[i]}20`,
                          color: COLORS[i],
                        }}
                      >
                        <span className="material-symbols-outlined text-3xl">{agent.icon}</span>
                      </div>
                      <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                        {agent.tier}
                      </span>
                    </div>
                    <h4
                      className="text-xl font-semibold text-slate-900 mb-1"
                      style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: COLORS[i] }}
                    >
                      {agent.name}
                    </h4>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6">
                      {agent.description}
                    </p>
                    <div className="pt-5 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Pricing</p>
                        <span className="text-sm font-bold" style={{ color: COLORS[i] }}>
                          ${agent.pricing.toFixed(3)}/req
                        </span>
                      </div>
                      <button
                        className="px-5 py-2 text-white rounded-full text-xs font-bold shadow-sm hover:opacity-90 no-print"
                        style={{ backgroundColor: COLORS[i] }}
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed spec table */}
            <section className="premium-card overflow-hidden rounded-2xl">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <span className="w-1 h-6 bg-indigo-600 rounded-full" />
                <h3
                  className="text-xl font-semibold text-slate-900"
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                >
                  Detailed Specifications
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white">
                      <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/4">
                        Metric
                      </th>
                      {selected.map((agent, i) => (
                        <th
                          key={agent.id}
                          className="px-8 py-6 text-sm font-bold border-l border-slate-100"
                          style={{ color: COLORS[i] }}
                        >
                          {agent.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {specRows.map((row) => (
                      <tr key={row.key} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-sm font-medium text-slate-500">
                          {row.label}
                        </td>
                        {selected.map((agent) => {
                          const val = agent[row.key as keyof Agent] as number;
                          return (
                            <td key={agent.id} className="px-8 py-5 border-l border-slate-100">
                              {row.key === "perfScore" || row.key === "successRate" ? (
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-24">
                                    <div
                                      className="h-full rounded-full transition-all duration-700"
                                      style={{
                                        width: `${val}%`,
                                        backgroundColor: COLORS[selected.indexOf(agent)],
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm font-bold text-slate-700">
                                    {row.format(val)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm font-semibold text-slate-800">
                                  {row.format(val)}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Bottom CTA cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
              <div className="bg-indigo-600 p-8 rounded-2xl text-white flex flex-col justify-between shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform" />
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-3" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    Automated Routing
                  </h4>
                  <p className="text-indigo-200 leading-relaxed text-sm">
                    Let intelligence orchestrate model selection based on task complexity.
                  </p>
                </div>
                <button className="mt-6 bg-white text-indigo-600 px-6 py-2.5 rounded-full font-bold text-sm w-fit relative z-10 hover:scale-105 transition-transform">
                  Enable Routing
                </button>
              </div>

              <div className="premium-card p-8 md:col-span-2 flex flex-col md:flex-row gap-6 items-center rounded-2xl">
                <div className="flex-1 space-y-3">
                  <h4 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    Cost Optimization Engine
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Simulation suggests routing <span className="font-bold text-slate-900">30%</span> of current traffic to a cheaper model could save you{" "}
                    <span className="text-teal-600 font-bold">$1,240/mo</span> without degrading accuracy.
                  </p>
                </div>
                <div className="w-full md:w-36 aspect-square bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
                  <div className="text-center">
                    <span className="block text-3xl font-extrabold text-teal-600" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      -22%
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
                      Projected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
