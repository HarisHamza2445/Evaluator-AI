"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  placeholder?: string;
}

export default function Header({ title, placeholder = "Search..." }: HeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="flex justify-between items-center px-16 sticky top-0 z-30 bg-white/70 backdrop-blur-xl h-20 border-b border-slate-200/50 shadow-sm shadow-slate-100/10">
      <div className="flex items-center gap-8 flex-1">
        <h1
          className="text-[22px] font-bold text-slate-800 tracking-tight shrink-0"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          {title}
        </h1>
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            id="header-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-50/70 hover:bg-slate-100/50 focus:bg-white border border-slate-150 rounded-full py-2 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-inner"
          />
        </form>
      </div>

      <div className="flex items-center gap-1">
        <button
          id="notifications-btn"
          className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
        <button
          id="settings-btn"
          className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
          title="Settings"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>
      </div>
    </header>
  );
}
