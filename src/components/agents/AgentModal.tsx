"use client";

import { useState, useEffect } from "react";

interface AgentFormData {
  name: string;
  provider: string;
  category: string;
  description: string;
  rating: string;
  perfScore: string;
  pricing: string;
  contextWindow: string;
  latency: string;
  successRate: string;
  tokensPerSec: string;
  icon: string;
  tier: string;
}

interface Agent extends AgentFormData {
  id: string;
}

interface AgentModalProps {
  agent?: Agent | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: AgentFormData = {
  name: "",
  provider: "",
  category: "Data & Analysis",
  description: "",
  rating: "4.5",
  perfScore: "90",
  pricing: "0.01",
  contextWindow: "128000",
  latency: "300",
  successRate: "99",
  tokensPerSec: "500",
  icon: "robot_2",
  tier: "standard",
};

export default function AgentModal({ agent, onClose, onSaved }: AgentModalProps) {
  const [form, setForm] = useState<AgentFormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (agent) {
      setForm({
        name: agent.name,
        provider: agent.provider,
        category: agent.category,
        description: agent.description,
        rating: String(agent.rating),
        perfScore: String(agent.perfScore),
        pricing: String(agent.pricing),
        contextWindow: String(agent.contextWindow),
        latency: String(agent.latency),
        successRate: String(agent.successRate),
        tokensPerSec: String(agent.tokensPerSec),
        icon: agent.icon,
        tier: agent.tier,
      });
    } else {
      setForm(EMPTY);
    }
  }, [agent]);

  function fieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = agent ? `/api/agents/${agent.id}` : "/api/agents";
    const method = agent ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }

    onSaved();
  }

  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";
  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 modal-backdrop"
      style={{ backgroundColor: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl fade-in">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2
            className="text-xl font-semibold text-slate-900"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            {agent ? "Edit Agent" : "Add New Agent"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Agent Name</label>
              <input name="name" value={form.name} onChange={fieldChange} required className={inputClass} placeholder="e.g. Astra Insights" />
            </div>
            <div>
              <label className={labelClass}>Provider</label>
              <input name="provider" value={form.provider} onChange={fieldChange} required className={inputClass} placeholder="e.g. DeepMinds Co." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={form.category} onChange={fieldChange} className={inputClass}>
                <option>Data & Analysis</option>
                <option>Content Creation</option>
                <option>Development</option>
                <option>Customer Ops</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Tier</label>
              <select name="tier" value={form.tier} onChange={fieldChange} className={inputClass}>
                <option value="standard">Standard</option>
                <option value="gold">Gold</option>
                <option value="enterprise">Enterprise</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={fieldChange}
              required
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="What does this agent do?"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Rating (0–5)</label>
              <input name="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={fieldChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Perf Score</label>
              <input name="perfScore" type="number" step="0.1" min="0" max="100" value={form.perfScore} onChange={fieldChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Price / req ($)</label>
              <input name="pricing" type="number" step="0.01" min="0" value={form.pricing} onChange={fieldChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Context Window</label>
              <input name="contextWindow" type="number" value={form.contextWindow} onChange={fieldChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Avg Latency (ms)</label>
              <input name="latency" type="number" value={form.latency} onChange={fieldChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Success Rate (%)</label>
              <input name="successRate" type="number" step="0.1" value={form.successRate} onChange={fieldChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tokens / sec</label>
              <input name="tokensPerSec" type="number" value={form.tokensPerSec} onChange={fieldChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Icon (Material Symbol)</label>
              <input name="icon" value={form.icon} onChange={fieldChange} className={inputClass} placeholder="e.g. robot_2" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20 disabled:opacity-60"
            >
              {loading ? "Saving..." : agent ? "Save changes" : "Add agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
