import { Suspense } from "react";
import MarketplaceClient from "@/components/marketplace/MarketplaceClient";

export const dynamic = "force-dynamic";

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading marketplace catalog...</p>
          </div>
        </div>
      }
    >
      <MarketplaceClient />
    </Suspense>
  );
}
