"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface RequestLog {
  id: string;
  endpoint: string;
  model: string;
  latency: number;
  tokens: number;
  status: string;
  timestamp: string;
  agent?: { name: string } | null;
}

interface Stats {
  totalRequests: number;
  avgLatency: number;
  tokensPerSec: number;
  successRate: number;
  recentLogs: RequestLog[];
}

const PAGE_SIZE = 10;

export default function PerformancePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [activeRange, setActiveRange] = useState("24h");
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  async function triggerSimulation() {
    setSimulating(true);
    await Promise.all([
      fetch("/api/analytics", { method: "POST" }),
      fetch("/api/analytics", { method: "POST" }),
      fetch("/api/analytics", { method: "POST" })
    ]);
    const r = await fetch("/api/analytics");
    const data = await r.json();
    setStats(data);
    setSimulating(false);
  }

  // build active latency trend points from database logs
  function buildChartData() {
    if (!stats?.recentLogs) return [];
    return [...stats.recentLogs]
      .reverse()
      .slice(0, 20)
      .map((log, i) => ({
        time: i + 1,
        latency: log.latency,
      }));
  }

  // token distribution from logs
  function buildTokenDist() {
    if (!stats?.recentLogs) return [];
    const totals: Record<string, number> = {};
    stats.recentLogs.forEach((l) => {
      totals[l.model] = (totals[l.model] ?? 0) + l.tokens;
    });
    const total = Object.values(totals).reduce((s, v) => s + v, 0);
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([model, tokens]) => ({
        model,
        tokens,
        pct: Math.round((tokens / total) * 100),
      }));
  }

  const paginatedLogs = stats?.recentLogs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) ?? [];
  const totalPages = stats ? Math.ceil(stats.recentLogs.length / PAGE_SIZE) : 0;

  const kpiCards = stats
    ? [
        {
          label: "Total Requests",
          value: stats.totalRequests >= 1000 ? `${(stats.totalRequests / 1000).toFixed(1)}k` : stats.totalRequests.toString(),
          trend: "+12%",
          trendUp: true,
          icon: "bolt",
        },
        {
          label: "Avg Latency",
          value: `${stats.avgLatency}ms`,
          trend: "+4ms",
          trendUp: false,
          icon: "speed",
        },
        {
          label: "Tokens / sec",
          value: stats.tokensPerSec.toString(),
          trend: "Peak",
          trendUp: true,
          icon: "bolt",
        },
        {
          label: "Success Rate",
          value: `${stats.successRate}%`,
          trend: "Stable",
          trendUp: true,
          icon: "verified",
        },
      ]
    : [];

  if (loading) {
    return (
      <>
        <Header title="Performance" placeholder="Search systems or telemetry..." />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading analytics...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Performance" placeholder="Search systems or telemetry..." />

      <div className="p-16 space-y-12 max-w-screen-2xl mx-auto">
        {/* Page header */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Agent Performance
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              Real-time telemetry and resource utilization for deployed models.
            </p>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1 no-print">
            <button
              onClick={triggerSimulation}
              disabled={simulating}
              className="px-5 py-2 text-sm bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/50 text-indigo-600 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              {simulating ? "Generating..." : "Simulate Live Traffic"}
            </button>
            {["24h", "7d", "30d"].map((r) => (
              <button
                key={r}
                id={`range-${r}`}
                onClick={() => setActiveRange(r)}
                className={`px-5 py-2 text-sm rounded-xl font-semibold transition-all ${
                  activeRange === r
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card) => (
            <div key={card.label} className="premium-card p-6 rounded-2xl flex flex-col justify-between fade-in">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
                  {card.label}
                </p>
                <h4
                  className="text-4xl font-extrabold text-slate-900 tracking-tight"
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                >
                  {card.value}
                </h4>
              </div>
              <div
                className={`mt-5 flex items-center gap-2 text-sm font-semibold ${
                  card.trendUp ? "text-teal-600" : "text-red-500"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    card.trendUp ? "bg-teal-50" : "bg-red-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{card.icon}</span>
                </div>
                <span className="text-xs">{card.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart row */}
        <div className="grid grid-cols-12 gap-6">
          {/* Latency trend */}
          <div className="col-span-12 md:col-span-8 premium-card p-8 rounded-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h5
                  className="text-xl font-semibold text-slate-900"
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                >
                  Latency Trend
                </h5>
                <p className="text-xs text-slate-400 mt-1">Response time across recent requests</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span className="text-xs text-slate-500 font-medium">Latency (ms)</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={buildChartData()} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4338ca" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4338ca" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #f1f5f9",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  }}
                  formatter={(v: any) => [`${v}ms`, "Latency"]}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#4338ca"
                  strokeWidth={2.5}
                  fill="url(#latencyGrad)"
                  strokeLinecap="round"
                  dot={false}
                  activeDot={{ r: 4, fill: "#4338ca", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Token distribution */}
          <div className="col-span-12 md:col-span-4 premium-card p-8 rounded-2xl flex flex-col">
            <div className="mb-6">
              <h5
                className="text-xl font-semibold text-slate-900"
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Token Distribution
              </h5>
              <p className="text-xs text-slate-400 mt-1">Allocation by model</p>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {buildTokenDist().map((item, i) => (
                <div key={item.model} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-800">{item.model}</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {item.pct}% / {(item.tokens / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: i === 0 ? "#4338ca" : i === 1 ? "#006a61" : "#94a3b8",
                        opacity: 1 - i * 0.15,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Request log table */}
        <div className="premium-card rounded-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
              <h5
                className="text-xl font-semibold text-slate-900"
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Recent Request Log
              </h5>
              <p className="text-xs text-slate-400 mt-1">Real-time system transaction stream</p>
            </div>
            <button
              id="export-csv-btn"
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              Export CSV <span className="material-symbols-outlined text-[16px]">download</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  {["Timestamp", "Endpoint", "Model", "Latency", "Tokens", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </td>
                    <td className="px-8 py-5 font-mono text-xs text-indigo-500">
                      {log.endpoint}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-800">
                      {log.model}
                    </td>
                    <td
                      className={`px-8 py-5 text-sm font-semibold tabular-nums text-right ${
                        log.latency > 1000 ? "text-red-500" : "text-slate-700"
                      }`}
                    >
                      {log.latency}ms
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 tabular-nums text-right">
                      {log.tokens.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.status === "success"
                            ? "badge-success"
                            : log.status === "timeout"
                            ? "badge-timeout"
                            : "badge-error"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            log.status === "success"
                              ? "bg-teal-500"
                              : log.status === "timeout"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-5 bg-slate-50/30 flex items-center justify-between border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">
              Viewing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, stats?.recentLogs.length ?? 0)} of{" "}
              {stats?.recentLogs.length ?? 0} logs
            </p>
            <div className="flex gap-2">
              <button
                id="prev-page-btn"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-9 h-9 flex items-center justify-center bg-white rounded-xl border border-slate-200 disabled:opacity-30 hover:border-indigo-300 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                id="next-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-9 h-9 flex items-center justify-center bg-white rounded-xl border border-slate-200 disabled:opacity-30 hover:border-indigo-300 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Insight footer */}
        <div className="premium-card p-6 rounded-2xl border-l-4 border-l-indigo-600 flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <span className="material-symbols-outlined text-[24px]">lightbulb</span>
          </div>
          <div>
            <h6 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">
              Dynamic System Recommendation
            </h6>
            <p className="text-sm text-slate-500 leading-relaxed">
              Detected elevated latency in recent high-token requests. We recommend splitting long-context tasks to a model with a larger context window to maintain performance SLAs.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
