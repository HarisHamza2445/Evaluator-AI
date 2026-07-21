"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/marketplace", label: "Marketplace", icon: "storefront" },
  { href: "/comparison", label: "Comparison", icon: "compare_arrows" },
  { href: "/performance", label: "Performance", icon: "monitoring" },
  { href: "/integrations", label: "Integrations", icon: "extension" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex flex-col p-8 bg-white/70 backdrop-blur-xl h-screen w-72 border-r border-slate-200/50 shadow-sm shadow-slate-100/40">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-16 px-2">
        <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}
          >
            dataset
          </span>
        </div>
        <span
          className="text-xl font-bold text-slate-800 tracking-tight"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          Evaluator AI
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                active
                  ? "sidebar-active"
                  : "text-slate-500 hover:bg-slate-900/5 hover:text-slate-800"
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="mt-auto pt-6 border-t border-slate-200/50">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-900/5 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100/50 border border-indigo-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-indigo-605 text-[22px]">account_circle</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {session?.user?.name ?? "User"}
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mt-0.5">
              {(session?.user as { role?: string })?.role ?? "member"}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
