"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { apiGet, formatCurrency, timeAgo } from "@/src/lib/api-client";
import { getItemIcon } from "@/src/lib/item-icons";
import { DesktopHeader } from "@/src/components/DesktopHeader";
import { MarketDetailScreenSkeleton } from "@/src/components/ui/Skeleton";
import { AppBottomNav } from "@/src/components/AppBottomNav";

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
  const isAuthenticated = true; // This page requires auth via requireServerSession

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
    <div className={`bg-slate-50 font-sans text-slate-900 antialiased min-h-screen ${className}`}>
      <DesktopHeader activeNav="/markets" showSubmitButton={false} />
      
      <div className="max-w-md mx-auto lg:max-w-7xl lg:px-6 min-h-screen flex flex-col relative lg:pb-0 pb-24">
        <div className="lg:bg-white lg:rounded-3xl lg:shadow-xl lg:shadow-slate-200/50 lg:border lg:border-slate-100 lg:mt-6 lg:overflow-hidden lg:min-h-[calc(100vh-6rem)]">
          {/* Mobile Header */}
          <header className="lg:hidden sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl px-4 py-3 border-b border-slate-200/50 flex items-center gap-3">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-soft hover:bg-slate-50 transition-colors text-slate-600">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold truncate text-slate-900">{data?.market.name ?? "Market Details"}</h1>
              <p className="text-xs text-slate-500 truncate">{data?.market.regionName ?? "Loading..."}</p>
            </div>
          </header>

          {/* Desktop Header */}
          <div className="hidden lg:block px-8 py-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => router.back()} 
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                  </button>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Market Details</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900">{data?.market.name ?? "Loading..."}</h1>
                <p className="text-slate-500 mt-1">{data?.market.regionName ?? ""}{data?.market.regionName && data?.market.country ? ", " : ""}{data?.market.country ?? ""}</p>
              </div>

            </div>
          </div>

          {loading && !data ? (
            <div className="p-4 lg:p-8">
              <MarketDetailScreenSkeleton />
            </div>
          ) : (
            <main className="px-4 py-6 lg:p-8 space-y-6 lg:space-y-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
              {/* Left Column - Market Info */}
              <section className="lg:col-span-1 bg-white lg:bg-slate-50 border border-slate-100 rounded-2xl p-5 lg:p-6 shadow-soft lg:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Shop Details</h2>
                      <p className="text-xl font-extrabold leading-tight text-slate-900 break-words">{data?.market.name ?? "-"}</p>
                      <p className="text-sm text-slate-500 font-medium mt-1">{data?.market.regionName ?? "-"}, {data?.market.country ?? "-"}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 shadow-sm border border-primary-100">
                      <span className="material-symbols-outlined text-2xl">storefront</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 lg:grid-cols-1 lg:gap-4 gap-3 mt-5">
                    <div className="bg-slate-50 lg:bg-white rounded-xl p-3 lg:p-4 border border-slate-100">
                      <p className="text-[10px] lg:text-xs uppercase text-slate-400 font-bold tracking-wide mb-0.5 lg:mb-1">Items</p>
                      <p className="text-lg lg:text-2xl font-extrabold text-slate-900">{data?.stats.itemCount ?? 0}</p>
                    </div>
                    <div className="bg-slate-50 lg:bg-white rounded-xl p-3 lg:p-4 border border-slate-100">
                      <p className="text-[10px] lg:text-xs uppercase text-slate-400 font-bold tracking-wide mb-0.5 lg:mb-1">Reports</p>
                      <p className="text-lg lg:text-2xl font-extrabold text-slate-900">{data?.stats.totalReports ?? 0}</p>
                    </div>
                    <div className="bg-slate-50 lg:bg-white rounded-xl p-3 lg:p-4 border border-slate-100">
                      <p className="text-[10px] lg:text-xs uppercase text-slate-400 font-bold tracking-wide mb-0.5 lg:mb-1">Updated</p>
                      <p className="text-sm lg:text-base font-bold text-slate-900 mt-1">{data?.stats.latestReportedAt ? timeAgo(data.stats.latestReportedAt) : "-"}</p>
                    </div>
                  </div>
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 lg:mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 lg:py-4 rounded-xl bg-emerald-600 text-white text-sm lg:text-base font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-lg">directions</span>
                    Get Directions
                  </a>
                </div>
              </section>

              {/* Right Column - Prices */}
              <section className="lg:col-span-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 lg:mb-4 px-1">Latest Prices</h3>
                <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                  {(data?.latestPrices ?? []).map((row) => (
                    <Link
                      key={row.itemId}
                      href={`/price-index?itemId=${row.itemId}`}
                      className="bg-white rounded-2xl p-4 lg:p-5 flex items-center justify-between gap-3 shadow-sm transition-all hover:shadow-md group border border-slate-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0 border border-slate-100 group-hover:scale-110 transition-transform">
                          {getItemIcon(row.itemName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate mb-0.5">{row.itemName}</p>
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {timeAgo(row.reportedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-extrabold text-slate-900 tabular-nums tracking-tight">{formatCurrency(row.price, row.currency)}</p>
                        <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 mt-0.5 ${row.status === 'verified' ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                          {row.status === 'verified' && <span className="material-symbols-outlined text-[10px]">verified</span>}
                          <span className="capitalize">{row.status}</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                  {!loading && (data?.latestPrices.length ?? 0) === 0 ? (
                    <div className="lg:col-span-2 text-sm text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                      <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">receipt_long</span>
                      <p className="font-bold">No reports for this market yet</p>
                    </div>
                  ) : null}
                </div>
              </section>

              {loading ? <p className="lg:col-span-3 text-sm text-slate-500 text-center animate-pulse">Loading market details...</p> : null}
              {error ? <div className="lg:col-span-3 text-sm text-rose-500 bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">{error}</div> : null}
            </main>
          )}
        </div>
      </div>
      
      <AppBottomNav />
    </div>
  );
};
