"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import AgentCard from "@/components/agents/AgentCard";
import AgentModal from "@/components/agents/AgentModal";

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

const CATEGORIES = ["All Agents", "Data & Analysis", "Content Creation", "Development", "Customer Ops"];
const CATEGORY_ICONS: Record<string, string> = {
  "All Agents": "all_inclusive",
  "Data & Analysis": "analytics",
  "Content Creation": "edit_note",
  "Development": "code",
  "Customer Ops": "support_agent",
};

export default function MarketplaceClient() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Agents");
  const [compareList, setCompareList] = useState<Agent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Dynamic Scorer Weights State
  const [weights, setWeights] = useState({
    accuracy: 25,
    speed: 25,
    memory: 25,
    efficiency: 25,
  });

  // Sandbox Playground State
  const [playgroundAgent, setPlaygroundAgent] = useState<Agent | null>(null);
  const [playMessage, setPlayMessage] = useState("");
  const [playHistory, setPlayHistory] = useState<Array<{ sender: "user" | "agent"; text: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const fetchAgents = useCallback(async (category?: string, search?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category && category !== "All Agents") params.set("category", category);
    if (search) params.set("search", search);

    const res = await fetch(`/api/agents?${params}`);
    const data = await res.json();
    setAgents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const search = searchParams.get("search") ?? undefined;
    fetchAgents(activeCategory, search);
  }, [activeCategory, searchParams, fetchAgents]);

  // persist compare list in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("compareList");
    if (saved) setCompareList(JSON.parse(saved));
  }, []);

  // auto scroll sandbox chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [playHistory, isTyping]);

  function toggleCompare(agent: Agent) {
    setCompareList((prev) => {
      const already = prev.find((a) => a.id === agent.id);
      const next = already ? prev.filter((a) => a.id !== agent.id) : [...prev, agent].slice(0, 3);
      localStorage.setItem("compareList", JSON.stringify(next));
      return next;
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this agent? This cannot be undone.")) return;
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    fetchAgents(activeCategory);
  }

  function openEdit(agent: Agent) {
    setEditingAgent(agent);
    setShowModal(true);
  }

  function openCreate() {
    setEditingAgent(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingAgent(null);
  }

  function onSaved() {
    closeModal();
    fetchAgents(activeCategory);
  }

  // Weight Scorer Math calculation
  const calculateDynamicScore = useCallback((agent: Agent) => {
    // 1. Accuracy normalized (already 0-100)
    const normAccuracy = agent.perfScore;

    // 2. Speed (latency: 50ms is best (100 pts), 1200ms+ is worst (0 pts))
    const normSpeed = Math.max(0, Math.min(100, ((1200 - agent.latency) / 1150) * 100));

    // 3. Memory (contextWindow: 200k+ is best (100 pts), 4k is worst (10 pts))
    const normMemory = Math.max(10, Math.min(100, (agent.contextWindow / 200000) * 100));

    // 4. Efficiency (pricing: $0.005 is best (100 pts), $1.50+ is worst (0 pts))
    const normEfficiency = Math.max(0, Math.min(100, ((1.50 - agent.pricing) / 1.495) * 100));

    const totalWeight = weights.accuracy + weights.speed + weights.memory + weights.efficiency;
    if (totalWeight === 0) return 0;

    const weightedScore = (
      (normAccuracy * weights.accuracy) +
      (normSpeed * weights.speed) +
      (normMemory * weights.memory) +
      (normEfficiency * weights.efficiency)
    ) / totalWeight;

    return Number(weightedScore.toFixed(1));
  }, [weights]);

  // Recalculated lists
  const scoredAgents = agents.map((agent) => ({
    ...agent,
    dynamicScore: calculateDynamicScore(agent),
  })).sort((a, b) => b.dynamicScore - a.dynamicScore);

  const topAgent = scoredAgents[0];
  const gridAgents = scoredAgents.slice(1);

  // Presets handlers
  function applyPreset(preset: "balanced" | "accuracy" | "speed" | "economy") {
    if (preset === "balanced") {
      setWeights({ accuracy: 25, speed: 25, memory: 25, efficiency: 25 });
    } else if (preset === "accuracy") {
      setWeights({ accuracy: 70, speed: 10, memory: 10, efficiency: 10 });
    } else if (preset === "speed") {
      setWeights({ accuracy: 10, speed: 70, memory: 10, efficiency: 10 });
    } else if (preset === "economy") {
      setWeights({ accuracy: 10, speed: 10, memory: 10, efficiency: 70 });
    }
  }

  // Playground simulated handler
  function openPlayground(agent: Agent) {
    setPlaygroundAgent(agent);
    setPlayMessage("");
    setPlayHistory([
      {
        sender: "agent",
        text: `Hello! I am ${agent.name}, initialized and ready for sandbox evaluation. Ask me anything to trace my responses. Baseline latency: ${agent.latency}ms, deployment tier: ${agent.tier.toUpperCase()}.`,
      },
    ]);
  }

  function handleSendPrompt(customText?: string) {
    const textToSend = customText || playMessage;
    if (!textToSend.trim() || !playgroundAgent) return;

    // Append user message
    setPlayHistory((prev) => [...prev, { sender: "user", text: textToSend }]);
    if (!customText) setPlayMessage("");

    // Trigger Typing
    setIsTyping(true);

    const answers = [
      `I processed that reasoning command in ${playgroundAgent.latency}ms using my ${playgroundAgent.tier} tier configuration. Based on my context window of ${playgroundAgent.contextWindow.toLocaleString()} tokens, I recommend using a vectorized draft approach directory.`,
      `Understood. With my success rate of ${playgroundAgent.successRate}%, I will format the response with optimized variables. Here is the operational specification blueprint you requested for your system.`,
      `An excellent inquiry! As a ${playgroundAgent.category} specialist, I suggest aligning your logic streams. That is priced at $${playgroundAgent.pricing.toFixed(3)} per transaction under my active plan.`,
    ];

    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

    setTimeout(() => {
      setIsTyping(false);
      setPlayHistory((prev) => [...prev, { sender: "agent", text: randomAnswer }]);
    }, 1200);
  }

  return (
    <>
      <Header title="Marketplace" placeholder="Search agents, skills, or providers..." />

      <div className="p-16 max-w-[1200px] mx-auto relative">
        {/* Category filters */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-semibold text-slate-900"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Browse by Domain
            </h2>
            {isAdmin && (
              <button
                id="add-agent-btn"
                onClick={openCreate}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Agent
              </button>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 custom-scroll">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  id={`category-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shrink-0 transition-all duration-200 ${
                    active
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {CATEGORY_ICONS[cat]}
                  </span>
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading agents...</p>
            </div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-slate-200 text-7xl block mb-4">search_off</span>
            <p className="text-slate-500 font-medium">No agents found</p>
            <p className="text-sm text-slate-400 mt-1">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            {/* Hero Agent */}
            {topAgent && (
              <article className="col-span-12 lg:col-span-8 air-card rounded-2xl overflow-hidden group">
                <div className="flex flex-col md:flex-row h-full">
                  <div className="md:w-3/5 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-5">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] rounded-lg font-bold uppercase tracking-widest border border-indigo-100">
                          {topAgent.tier} tier
                        </span>
                        {weights.accuracy !== 25 || weights.speed !== 25 || weights.memory !== 25 || weights.efficiency !== 25 ? (
                          <span className="px-2.5 py-0.5 bg-teal-50 text-teal-600 text-[9px] rounded-md font-bold uppercase border border-teal-100 animate-pulse">
                            Tuned Score
                          </span>
                        ) : null}
                      </div>
                      <h3
                        className="text-3xl font-bold text-slate-900 mb-3 tracking-tight"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        {topAgent.name}
                      </h3>
                      <p className="text-slate-500 leading-relaxed text-[15px]">
                        {topAgent.description}
                      </p>
                    </div>

                    <div className="mt-8 space-y-5">
                      <div className="flex items-center gap-8">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Score</p>
                          <p className="text-3xl font-extrabold text-slate-950" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                            {topAgent.dynamicScore.toFixed(1)}
                          </p>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Pricing</p>
                          <p className="text-3xl font-extrabold text-slate-905" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                            ${topAgent.pricing.toFixed(2)}
                            <span className="text-sm font-normal text-slate-400">/req</span>
                          </p>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Rating</p>
                          <div className="flex items-center gap-1">
                            <p className="text-3xl font-extrabold text-slate-950" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                              {topAgent.rating.toFixed(1)}
                            </p>
                            <span className="material-symbols-outlined text-amber-400 text-xl mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          id={`hero-compare-btn`}
                          onClick={() => toggleCompare(topAgent)}
                          className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                            compareList.find((a) => a.id === topAgent.id)
                              ? "bg-indigo-600 text-white"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        >
                          {compareList.find((a) => a.id === topAgent.id) ? "✓ Added to Compare" : "Add to Compare"}
                        </button>
                        <button
                          onClick={() => openPlayground(topAgent)}
                          className="p-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors border border-indigo-100 flex items-center justify-center"
                          title="Interact sandbox"
                        >
                          <span className="material-symbols-outlined text-[20px]">forum</span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => openEdit(topAgent)}
                            className="p-3.5 bg-white rounded-xl hover:bg-slate-50 transition-colors border border-slate-200 text-slate-500"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* right image portion */}
                  <div className="md:w-2/5 bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center min-h-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent w-20 z-10" />
                    <span
                      className="material-symbols-outlined text-indigo-200 group-hover:scale-110 transition-transform duration-700"
                      style={{ fontSize: "140px", fontVariationSettings: "'FILL' 1" }}
                    >
                      {topAgent.icon}
                    </span>
                  </div>
                </div>
              </article>
            )}

            {/* Side Panel (Tuning Panel + Quick Compare) */}
            <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              
              {/* Dynamic Weight Tuning Panel */}
              <div className="air-card rounded-2xl p-6 bg-slate-900 border-slate-800 text-white shadow-xl shadow-slate-900/10">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-indigo-400 mb-4 flex justify-between items-center">
                  <span>Dynamic Weighting Console</span>
                  <span className="material-symbols-outlined text-[16px] animate-spin-slow">settings</span>
                </h4>
                
                {/* Presets */}
                <div className="grid grid-cols-4 gap-1.5 mb-5 pb-5 border-b border-slate-800">
                  {["balanced", "accuracy", "speed", "economy"].map((pre) => (
                    <button
                      key={pre}
                      onClick={() => applyPreset(pre as never)}
                      className="text-[9px] uppercase tracking-wider py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-slate-800 transition-all text-center"
                    >
                      {pre}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {/* Accuracy slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                      <span>Reasoning Quality</span>
                      <span className="text-indigo-400 font-mono text-[10px]">{weights.accuracy}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights.accuracy}
                      onChange={(e) => setWeights(w => ({ ...w, accuracy: Number(e.target.value) }))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>

                  {/* Speed slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                      <span>Low Latency</span>
                      <span className="text-indigo-400 font-mono text-[10px]">{weights.speed}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights.speed}
                      onChange={(e) => setWeights(w => ({ ...w, speed: Number(e.target.value) }))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>

                  {/* Memory slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                      <span>Context Window</span>
                      <span className="text-indigo-400 font-mono text-[10px]">{weights.memory}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights.memory}
                      onChange={(e) => setWeights(w => ({ ...w, memory: Number(e.target.value) }))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>

                  {/* Cost/Efficiency slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                      <span>Cost Efficiency</span>
                      <span className="text-indigo-400 font-mono text-[10px]">{weights.efficiency}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights.efficiency}
                      onChange={(e) => setWeights(w => ({ ...w, efficiency: Number(e.target.value) }))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Compare Sidebar */}
              <div className="air-card rounded-2xl p-6">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-5">
                  Quick Compare
                </h4>
                <div className="space-y-2 mb-5">
                  {compareList.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 group/item"
                    >
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-indigo-500 text-[18px]">{agent.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{agent.name}</p>
                        <p className="text-[11px] text-slate-400">Score: {calculateDynamicScore(agent).toFixed(1)}</p>
                      </div>
                      <button
                        onClick={() => toggleCompare(agent)}
                        className="text-slate-300 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all font-bold"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ))}

                  {compareList.length < 3 && (
                    <div className="flex items-center justify-center p-5 border border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition-all cursor-pointer bg-slate-50/50">
                      <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
                      <span className="text-sm font-medium">Add to compare</span>
                    </div>
                  )}
                </div>

                <a
                  href="/comparison"
                  className={`w-full block text-center py-3 rounded-xl text-sm font-semibold transition-all border ${
                    compareList.length >= 2
                      ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                      : "border-slate-200 text-slate-300 cursor-not-allowed"
                  }`}
                  onClick={(e) => compareList.length < 2 && e.preventDefault()}
                >
                  Compare Now {compareList.length >= 2 && `(${compareList.length})`}
                </a>
              </div>
            </aside>

            {/* Agent grid */}
            <section className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
              {gridAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={{ ...agent, perfScore: agent.dynamicScore }}
                  isInCompare={!!compareList.find((a) => a.id === agent.id)}
                  isAdmin={isAdmin}
                  onCompareToggle={toggleCompare}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onInteract={openPlayground}
                />
              ))}
            </section>
          </div>
        )}

        {/* Footer meta */}
        <footer className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <p className="text-xs text-slate-400 font-medium">
            Showing {agents.length} agent{agents.length !== 1 ? "s" : ""} in this view.
          </p>
          <div className="flex gap-6">
            {["Market Guidelines", "Provider Program", "API Docs"].map((link) => (
              <a key={link} href="#" className="text-xs text-slate-500 hover:text-indigo-600 transition-colors font-semibold">
                {link}
              </a>
            ))}
          </div>
        </footer>
      </div>

      {/* FAB */}
      {isAdmin && (
        <button
          id="fab-add-agent"
          onClick={openCreate}
          className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group/fab z-50"
        >
          <span className="material-symbols-outlined text-[24px]">add</span>
          <div className="absolute right-16 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs whitespace-nowrap opacity-0 group-hover/fab:opacity-100 transition-all pointer-events-none font-semibold">
            List Your Agent
          </div>
        </button>
      )}

      {/* Playground Drawer Panel overlay */}
      {playgroundAgent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99] flex justify-end transition-opacity duration-300">
          <div 
            className="w-full max-w-lg bg-white h-screen shadow-2xl flex flex-col relative z-20 animate-slide-in-right border-l border-slate-150"
          >
            {/* Header info */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  <span className="material-symbols-outlined text-lg">{playgroundAgent.icon}</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 leading-tight">
                    {playgroundAgent.name} Sandbox
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {playgroundAgent.provider} • {playgroundAgent.tier}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPlaygroundAgent(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors border border-slate-200"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Quick stats grid inside drawer */}
            <div className="px-6 py-4 bg-indigo-50/50 border-b border-indigo-100/50 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-indigo-100/50">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide">Avg Latency</span>
                <span className="text-xs font-extrabold text-slate-800">{playgroundAgent.latency}ms</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-indigo-100/50">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide">Context Window</span>
                <span className="text-xs font-extrabold text-slate-800">{(playgroundAgent.contextWindow/1000).toFixed(0)}k</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-indigo-100/50">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide">Success Rate</span>
                <span className="text-xs font-extrabold text-slate-800">{playgroundAgent.successRate}%</span>
              </div>
            </div>

            {/* Chat Messages scroll area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 select-none">
              {playHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${item.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      item.sender === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10" 
                        : "bg-slate-100 text-slate-700 rounded-tl-none border border-slate-150"
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-3 px-4 rounded-2xl rounded-tl-none border border-slate-150 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Prompt Chips Bar */}
            <div className="px-6 py-2 border-t border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar">
              {[
                "Calculate total request stats", 
                "Build structural parsing draft", 
                "Estimate pricing breakdown"
              ].map(chip => (
                <button
                  key={chip}
                  onClick={() => handleSendPrompt(chip)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-[10px] font-semibold text-slate-500 whitespace-nowrap transition-all shadow-sm shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder={`Write testing message to ${playgroundAgent.name}...`}
                  value={playMessage}
                  onChange={(e) => setPlayMessage(e.target.value)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100/50 focus:bg-white px-4 py-3 rounded-xl border border-slate-205 text-sm outline-none transition-all focus:border-indigo-400"
                />
                <button
                  type="submit"
                  disabled={!playMessage.trim()}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-md shadow-indigo-600/10"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <AgentModal
          agent={editingAgent as never}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
