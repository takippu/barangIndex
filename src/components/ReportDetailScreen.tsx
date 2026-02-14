"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { apiGet, formatCurrency, timeAgo } from "@/src/lib/api-client";
import { getItemIcon } from "@/src/lib/item-icons";

type ReportDetail = {
  id: number;
  itemId: number;
  itemName: string;
  itemCategory: string;
  defaultUnit: string;
  currency: string;
  marketId: number;
  marketName: string;
  regionId: number;
  regionName: string;
  country: string;
  price: string;
  status: "pending" | "verified" | "rejected";
  reportedAt: string;
  createdAt: string;
};

export const ReportDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ reportId: string }>();

  const [data, setData] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reportId = Number.parseInt(params.reportId ?? "", 10);
    if (!Number.isFinite(reportId)) {
      setError("Invalid report id");
      setLoading(false);
      return;
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiGet<ReportDetail>(`/api/v1/price-reports/${reportId}`);
        if (!mounted) return;
        setData(result);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [params.reportId]);

  return (
    <div className="bg-[#f6f8f7] font-display text-[#1a2e21] min-h-screen pb-24">
      <div className="max-w-md mx-auto min-h-screen flex flex-col pb-8">
        <header className="sticky top-0 z-20 bg-[#f6f8f7]/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-[#17cf5a]/10">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors" onClick={() => router.back()}>
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div className="flex-1 px-3">
            <h1 className="text-sm font-semibold text-[#17cf5a] uppercase tracking-wider">Report Detail</h1>
            <h2 className="text-lg font-extrabold leading-tight">Community Submission</h2>
          </div>
          <span className="w-10 h-10 rounded-full bg-white border border-[#17cf5a]/10 flex items-center justify-center text-xs font-bold">
            #{data?.id ?? "..."}
          </span>
        </header>

        {loading && <p className="px-4 py-6 text-sm text-gray-500">Loading report...</p>}
        {error && <p className="px-4 py-6 text-sm text-red-500">{error}</p>}

        {data ? (
          <main className="px-4 py-4 space-y-4">
            <section className="bg-white rounded-2xl border border-[#17cf5a]/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#17cf5a]/10 flex items-center justify-center text-2xl">
                    {getItemIcon(data.itemName, data.itemCategory)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{data.itemName}</p>
                    <p className="text-xs text-gray-500">{data.itemCategory} • {data.defaultUnit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold">{formatCurrency(data.price, data.currency)}</p>
                  <p className="text-[11px] text-gray-500">per {data.defaultUnit}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Reported {timeAgo(data.reportedAt)}</span>
                <span className={`px-2 py-1 rounded-full font-bold ${data.status === "verified" ? "text-blue-600 bg-blue-50" : data.status === "pending" ? "text-amber-700 bg-amber-50" : "text-red-600 bg-red-50"}`}>
                  {data.status.toUpperCase()}
                </span>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-[#17cf5a]/10 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Location</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Market:</span> {data.marketName}</p>
                <p><span className="font-semibold">Region:</span> {data.regionName}</p>
                <p><span className="font-semibold">Country:</span> {data.country}</p>
              </div>
            </section>

            <Link href={`/price-index?itemId=${data.itemId}`} className="w-full bg-[#1a2e21] text-white py-4 rounded-xl shadow-lg shadow-[#1a2e21]/20 flex items-center justify-between px-6 hover:bg-gray-800 transition-colors group">
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-[#17cf5a] uppercase tracking-wider mb-0.5">Price history</span>
                <span className="text-lg font-bold">View Item Index</span>
              </div>
              <span className="material-symbols-outlined text-[#17cf5a] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </main>
        ) : null}
      </div>
    </div>
  );
};
