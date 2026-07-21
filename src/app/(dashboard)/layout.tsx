"use client";

import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 ml-72 min-h-screen">
          {children}
        </div>
      </div>
    </SessionProvider>
  );
}
