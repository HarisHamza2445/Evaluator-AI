"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";

interface CloudProvider {
  id: string;
  name: string;
  region: string;
  instances: string;
  status: "online" | "offline" | "degraded";
  icon: string;
  color: string;
}

interface ApiKey {
  id: string;
  name: string;
  masked: string;
  type: string;
  lastUsed: string;
  active: boolean;
}

interface Webhook {
  id: string;
  endpoint: string;
  events: string[];
  status: "active" | "paused";
  uptime: number;
}

const providers: CloudProvider[] = [
  {
    id: "aws",
    name: "AWS Main",
    region: "us-east-1 • 14 Instances",
    status: "online",
    icon: "cloud",
    color: "#FF9900",
    instances: "14",
  },
  {
    id: "gcp",
    name: "Google Cloud",
    region: "europe-west3 • 6 Clusters",
    status: "online",
    icon: "cloud",
    color: "#4285F4",
    instances: "6",
  },
  {
    id: "azure",
    name: "Azure Cluster",
    region: "Credential expired 2h ago",
    status: "offline",
    icon: "cloud",
    color: "#0078D4",
    instances: "0",
  },
];

const apiKeys: ApiKey[] = [
  {
    id: "1",
    name: "Production_Main",
    masked: "sk_live_•••••••••4a82",
    type: "Root",
    lastUsed: "4 mins ago",
    active: true,
  },
  {
    id: "2",
    name: "Staging_V2",
    masked: "sk_test_•••••••••9f21",
    type: "Read-Only",
    lastUsed: "2 days ago",
    active: true,
  },
  {
    id: "3",
    name: "CI_Pipeline",
    masked: "sk_live_•••••••••b7c3",
    type: "Write",
    lastUsed: "12 hours ago",
    active: false,
  },
];

const webhooks: Webhook[] = [
  {
    id: "1",
    endpoint: "api.myapp.com/webhooks/agent",
    events: ["AGENT_CREATED", "FAILURE"],
    status: "active",
    uptime: 98.2,
  },
  {
    id: "2",
    endpoint: "slack.com/services/B0123...",
    events: ["SUCCESS"],
    status: "paused",
    uptime: 0,
  },
  {
    id: "3",
    endpoint: "hooks.zapier.com/catch/xxxx",
    events: ["AGENT_UPDATED"],
    status: "active",
    uptime: 99.8,
  },
];

export default function IntegrationsPage() {
  const [keys, setKeys] = useState(apiKeys);
  const [hooks, setHooks] = useState(webhooks);

  function copyKey(masked: string) {
    navigator.clipboard.writeText(masked).catch(() => {});
  }

  function toggleWebhook(id: string) {
    setHooks((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, status: h.status === "active" ? "paused" : "active" } : h
      )
    );
  }

  function deleteWebhook(id: string) {
    setHooks((prev) => prev.filter((h) => h.id !== id));
  }

  function revokeKey(id: string) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  return (
    <>
      <Header title="Integrations" placeholder="Search resources and keys..." />

      <div className="p-16 space-y-12 max-w-container-max mx-auto">
        {/* Page header */}
        <div className="flex flex-col gap-3">
          <h2
            className="text-3xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            Integration & Deployment
          </h2>
          <p className="text-slate-500 text-[15px] max-w-2xl leading-relaxed">
            Manage cloud infrastructure, API keys, and webhook endpoints from one place. Everything you need to keep your agent pipelines running smoothly.
          </p>
        </div>

        {/* Cloud providers */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3
              className="text-xl font-semibold text-slate-900 flex items-center gap-2"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              <span className="material-symbols-outlined text-indigo-600">cloud</span>
              Cloud Infrastructure
            </h3>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-4 py-1.5 rounded-full uppercase tracking-wider">
              {providers.filter((p) => p.status === "online").length} Active Nodes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers.map((p) => (
              <div
                key={p.id}
                className={`air-card p-6 rounded-xl flex flex-col h-full ${
                  p.status === "offline" ? "border-red-100 bg-red-50/30" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-100"
                    style={{ backgroundColor: `${p.color}15` }}
                  >
                    <span
                      className="material-symbols-outlined text-3xl"
                      style={{ color: p.color, fontVariationSettings: "'FILL' 1" }}
                    >
                      {p.icon}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      p.status === "online"
                        ? "bg-teal-50 text-teal-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        p.status === "online" ? "bg-teal-500" : "bg-red-500"
                      }`}
                    />
                    {p.status}
                  </div>
                </div>

                <h4
                  className="text-lg font-semibold text-slate-900 mb-1"
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                >
                  {p.name}
                </h4>
                <p
                  className={`text-xs mb-6 ${
                    p.status === "offline" ? "text-red-500" : "text-slate-400"
                  }`}
                >
                  {p.region}
                </p>

                <div className="mt-auto flex gap-2">
                  {p.status === "offline" ? (
                    <button
                      id={`reconnect-${p.id}`}
                      className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                      Reconnect
                    </button>
                  ) : (
                    <button
                      id={`manage-${p.id}`}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Manage
                    </button>
                  )}
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Add provider */}
            <button
              id="add-provider-btn"
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-slate-400 group min-h-[160px]"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-indigo-500 text-2xl">add</span>
              </div>
              <span className="text-sm font-semibold group-hover:text-indigo-600">Connect Provider</span>
            </button>
          </div>
        </section>

        {/* API keys + Webhooks */}
        <div className="grid grid-cols-12 gap-8">
          {/* API Key Management */}
          <section className="col-span-12 lg:col-span-5 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3
                className="text-xl font-semibold text-slate-900 flex items-center gap-2"
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                <span className="material-symbols-outlined text-indigo-600">vpn_key</span>
                API Management
              </h3>
              <button
                id="new-key-btn"
                className="text-indigo-600 text-xs font-bold uppercase tracking-widest hover:underline"
              >
                + New Secret
              </button>
            </div>

            <div className="air-card rounded-xl overflow-hidden divide-y divide-slate-100">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="p-5 hover:bg-slate-50/50 transition-colors cursor-pointer group/key"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-800 group-hover/key:text-indigo-600 transition-colors">
                      {key.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md font-bold border ${
                          key.type === "Root"
                            ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                            : "bg-slate-50 text-slate-500 border-slate-100"
                        }`}
                      >
                        {key.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                      {key.masked}
                    </code>
                    <button
                      onClick={() => copyKey(key.masked)}
                      className="text-slate-300 hover:text-indigo-500 opacity-0 group-hover/key:opacity-100 transition-all"
                      title="Copy"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">history</span>
                        {key.lastUsed}
                      </span>
                      {key.active && (
                        <span className="flex items-center gap-1 text-teal-600 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          Active
                        </span>
                      )}
                    </div>
                    <button
                      id={`revoke-${key.id}`}
                      onClick={() => revokeKey(key.id)}
                      className="text-[11px] text-slate-300 hover:text-red-500 opacity-0 group-hover/key:opacity-100 transition-all font-medium"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-indigo-400 text-[20px] mt-0.5">verified_user</span>
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Security Standards
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Keys are AES-256 encrypted. Avoid hardcoding credentials in agent logic — use environment injectors instead.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Webhooks */}
          <section className="col-span-12 lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3
                className="text-xl font-semibold text-slate-900 flex items-center gap-2"
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                <span className="material-symbols-outlined text-indigo-600">webhook</span>
                Event Webhooks
              </h3>
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
            </div>

            <div className="air-card rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Destination", "Status", "Uptime", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hooks.map((hook) => (
                    <tr key={hook.id} className={`hover:bg-slate-50/30 transition-colors ${hook.status === "paused" ? "opacity-60" : ""}`}>
                      <td className="px-5 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">
                            {hook.endpoint}
                          </span>
                          <div className="flex gap-1.5 flex-wrap">
                            {hook.events.map((ev) => (
                              <span
                                key={ev}
                                className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded"
                              >
                                {ev}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[10px] font-bold uppercase ${
                            hook.status === "active"
                              ? "bg-teal-50 text-teal-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              hook.status === "active" ? "bg-teal-500" : "bg-slate-400"
                            }`}
                          />
                          {hook.status}
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        {hook.status === "active" ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-500 rounded-full"
                                style={{ width: `${hook.uptime}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{hook.uptime}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex gap-1">
                          <button
                            id={`toggle-hook-${hook.id}`}
                            onClick={() => toggleWebhook(hook.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                            title={hook.status === "active" ? "Pause" : "Resume"}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {hook.status === "active" ? "pause" : "play_arrow"}
                            </span>
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 transition-all">
                            <span className="material-symbols-outlined text-[16px]">settings</span>
                          </button>
                          <button
                            id={`delete-hook-${hook.id}`}
                            onClick={() => deleteWebhook(hook.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Floating sync indicator */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-white px-5 py-3.5 rounded-full flex items-center gap-4 border border-slate-100 shadow-xl shadow-slate-200/80">
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] animate-spin" style={{ animationDuration: "3s" }}>
              sync
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest block">
              Cluster Sync
            </span>
            <span className="text-xs text-teal-600 font-semibold">4 Agents Syncing</span>
          </div>
        </div>
      </div>
    </>
  );
}
