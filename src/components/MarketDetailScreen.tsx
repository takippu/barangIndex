"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { apiGet, formatCurrency, timeAgo } from "@/src/lib/api-client";
import { getItemIcon } from "@/src/lib/item-icons";
import { MarketDetailScreenSkeleton } from "@/src/components/ui/Skeleton";

interface MarketDetailScreenProps {
  readonly marketId: number;
  readonly className?: string;
}

type MarketDetailPayload = {
  market: {
    id: number;
    name: string;
    latitude: string | null;
    longitude: string | null;
    regionId: number;
    regionName: string;
    country: string;
  };
  stats: {
    totalReports: number;
    latestReportedAt: string | null;
    itemCount: number;
  };
  latestPrices: Array<{
    itemId: number;
    itemName: string;
    price: string;
    currency: string;
    status: "pending" | "verified" | "rejected";
    reportedAt: string;
  }>;
};

export const MarketDetailScreen: React.FC<MarketDetailScreenProps> = ({ marketId, className = "" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedItemId = Number.parseInt(searchParams.get("itemId") ?? "", 10);

  const [data, setData] = useState<MarketDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await apiGet<MarketDetailPayload>(`/api/v1/markets/${marketId}`);
        if (!mounted) return;
        setData(payload);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load market");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [marketId]);

  const directionsHref = useMemo(() => {
    const latitude = data?.market.latitude;
    const longitude = data?.market.longitude;
    if (latitude && longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}`;
    }
    const query = `${data?.market.name ?? ""} ${data?.market.regionName ?? ""}`.trim();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }, [data?.market.latitude, data?.market.longitude, data?.market.name, data?.market.regionName]);

  return (
    <div className={`bg-[#f6f8f7] font-display text-[#1a2e21] antialiased min-h-screen pb-24 ${className}`}>
      <div className="max-w-md mx-auto min-h-screen">
        <header className="sticky top-0 z-20 bg-[#f6f8f7]/90 backdrop-blur-md px-4 py-3 border-b border-[#17cf5a]/10 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full hover:bg-[#17cf5a]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-extrabold truncate">{data?.market.name ?? "Market Details"}</h1>
            <p className="text-xs text-gray-500 truncate">{data?.market.regionName ?? "Loading..."}</p>
          </div>
        </header>

        {loading && !data ? (
          <MarketDetailScreenSkeleton />
        ) : (
          <main className="px-4 py-4 space-y-4">
            <section className="bg-white border border-[#17cf5a]/10 rounded-2xl p-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Shop Details</h2>
              <p className="text-lg font-extrabold mt-1 break-words">{data?.market.name ?? "-"}</p>
              <p className="text-sm text-gray-500">{data?.market.regionName ?? "-"}, {data?.market.country ?? "-"}</p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="rounded-lg border border-[#17cf5a]/10 p-2">
                  <p className="text-[10px] uppercase text-gray-400 font-bold">Items</p>
                  <p className="text-sm font-extrabold">{data?.stats.itemCount ?? 0}</p>
                </div>
                <div className="rounded-lg border border-[#17cf5a]/10 p-2">
                  <p className="text-[10px] uppercase text-gray-400 font-bold">Reports</p>
                  <p className="text-sm font-extrabold">{data?.stats.totalReports ?? 0}</p>
                </div>
                <div className="rounded-lg border border-[#17cf5a]/10 p-2">
                  <p className="text-[10px] uppercase text-gray-400 font-bold">Updated</p>
                  <p className="text-sm font-extrabold">{data?.stats.latestReportedAt ? timeAgo(data.stats.latestReportedAt) : "-"}</p>
                </div>
              </div>
              <a
                href={directionsHref}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#17cf5a] text-white text-sm font-bold"
              >
                <span className="material-symbols-outlined text-base">directions</span>
                Get Directions
              </a>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Latest Prices</h3>
              <div className="space-y-2">
                {(data?.latestPrices ?? []).map((row) => (
                  <Link
                    key={row.itemId}
                    href={`/price-index?itemId=${row.itemId}`}
                    className={`bg-white rounded-xl border p-3 flex items-center justify-between gap-3 ${row.itemId === selectedItemId ? "border-[#17cf5a]/40" : "border-[#17cf5a]/10"
                      }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#17cf5a]/10 flex items-center justify-center text-lg shrink-0">
                        {getItemIcon(row.itemName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{row.itemName}</p>
                        <p className="text-[11px] text-gray-500">{timeAgo(row.reportedAt)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold">{formatCurrency(row.price, row.currency)}</p>
                      <p className="text-[11px] text-gray-500 capitalize">{row.status}</p>
                    </div>
                  </Link>
                ))}
                {!loading && (data?.latestPrices.length ?? 0) === 0 ? (
                  <div className="text-sm text-gray-500 bg-white rounded-xl border border-dashed border-[#17cf5a]/20 p-3">
                    No reports for this market yet.
                  </div>
                ) : null}
              </div>
            </section>

            {loading ? <p className="text-sm text-gray-500">Loading market details...</p> : null}
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
          </main>
        )}
      </div>
    </div>
  );
};
