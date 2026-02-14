"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { apiGet, formatCurrency, timeAgo } from '@/src/lib/api-client';
import { getItemIcon } from '@/src/lib/item-icons';
import { getPreferredRegionId } from '@/src/lib/region-preference';
import { AppBottomNav } from '@/src/components/AppBottomNav';
import { MarketsScreenSkeleton } from '@/src/components/ui/Skeleton';

interface MarketsScreenProps {
    readonly className?: string;
}

type Market = {
    id: number;
    name: string;
    category: string;
    defaultUnit: string;
    currency: string;
};

type ItemTrendSnapshot = {
    latestPrice: string | null;
    avgPrice: string;
    reportCount: number;
    latestReportedAt: string | null;
};

export const MarketsScreen: React.FC<MarketsScreenProps> = ({ className = '' }) => {
    const router = useRouter();
    const [items, setItems] = useState<Market[]>([]);
    const [itemTrends, setItemTrends] = useState<Record<number, ItemTrendSnapshot>>({});
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const q = query.trim();
                const url = q ? `/api/v1/items?limit=100&q=${encodeURIComponent(q)}` : '/api/v1/items?limit=100';
                const data = await apiGet<Market[]>(url);
                if (!mounted) return;
                setItems(data);

                const preferredRegionId = getPreferredRegionId();
                const regionQuery = preferredRegionId ? `&regionId=${preferredRegionId}` : '';
                const snapshots = await Promise.all(
                    data.map(async (item) => {
                        try {
                            const priceIndex = await apiGet<{
                                stats: {
                                    latestPrice: string | null;
                                    avgPrice: string;
                                    reportCount: number;
                                    latestReportedAt: string | null;
                                };
                            }>(`/api/v1/price-index/${item.id}?timeframe=30d${regionQuery}`);

                            return [
                                item.id,
                                {
                                    latestPrice: priceIndex.stats.latestPrice,
                                    avgPrice: priceIndex.stats.avgPrice,
                                    reportCount: priceIndex.stats.reportCount,
                                    latestReportedAt: priceIndex.stats.latestReportedAt,
                                },
                            ] as const;
                        } catch {
                            return [
                                item.id,
                                {
                                    latestPrice: null,
                                    avgPrice: "0",
                                    reportCount: 0,
                                    latestReportedAt: null,
                                },
                            ] as const;
                        }
                    }),
                );

                if (!mounted) return;
                setItemTrends(Object.fromEntries(snapshots));
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load items');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        const timeout = setTimeout(() => {
            void load();
        }, 200);

        return () => {
            clearTimeout(timeout);
            mounted = false;
        };
    }, [query]);

    return (
        <div className={`bg-slate-50 font-sans text-slate-900 antialiased min-h-screen pb-32 ${className}`}>
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative bottom-nav-safe">

                {/* Header */}
                <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl px-4 pt-6 pb-4 border-b border-slate-200/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Market Overview</h1>
                            <p className="text-sm text-slate-500 font-medium mt-1">Real-time prices from community reports</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                            <span className="material-symbols-outlined">storefront</span>
                        </div>
                    </div>
                </header>

                <section className="px-4 pb-4 pt-2">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder-slate-400 outline-none shadow-soft transition-all"
                            placeholder="Search item name..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                </section>

                {/* Cards Container */}
                <div className="px-4 space-y-3 pb-4">
                    {items.map((item) => (
                        (() => {
                            const trend = itemTrends[item.id];
                            const latest = Number.parseFloat(trend?.latestPrice ?? '0');
                            const avg = Number.parseFloat(trend?.avgPrice ?? '0');
                            const trendPct = avg > 0 ? ((latest - avg) / avg) * 100 : 0;
                            const trendUp = trendPct > 0;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => router.push(`/search?query=${encodeURIComponent(item.name)}`)}
                                    className="bg-white p-4 rounded-2xl shadow-soft border border-slate-100 active:scale-[0.99] transition-all cursor-pointer hover:shadow-md group"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between gap-3 mb-4 border-b border-slate-50 pb-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                                                {getItemIcon(item.name, item.category)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-base text-slate-900 truncate">{item.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 min-w-[96px]">
                                            <p className="text-xl leading-tight font-extrabold text-slate-900 tabular-nums tracking-tight">
                                                {formatCurrency(trend?.latestPrice ?? 0, item.currency)}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium">Latest Price</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 items-stretch">
                                        <div className="bg-slate-50 rounded-xl p-2.5">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Unit</p>
                                            <span className="font-bold text-sm text-slate-700">/{item.defaultUnit}</span>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-2.5">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">30D Trend</p>
                                            {Math.abs(trendPct) < 0.05 ? (
                                                <span className="inline-flex items-center gap-0.5 text-sm font-bold text-slate-500">
                                                    <span className="material-symbols-outlined text-[14px]">remove</span>
                                                    0.0%
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center gap-0.5 text-sm font-bold ${trendUp ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    <span className="material-symbols-outlined text-[14px]">{trendUp ? 'trending_up' : 'trending_down'}</span>
                                                    {Number.isFinite(trendPct) ? `${trendPct >= 0 ? '+' : ''}${trendPct.toFixed(1)}%` : '0.0%'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-2.5 text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Reports</p>
                                            <span className="font-extrabold text-sm text-primary-600">{trend?.reportCount ?? 0}</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                                            {trend?.latestReportedAt ? `Updated ${timeAgo(trend.latestReportedAt)}` : 'No recent updates'}
                                        </div>
                                        <span className="text-xs font-bold text-primary-600 flex items-center gap-1 group-hover:text-primary-700 transition-colors">
                                            View details <span className="material-symbols-outlined text-base">arrow_forward</span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })()
                    ))}
                    {!loading && items.length === 0 && (
                        <div className="text-sm text-slate-500 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inventory_2</span>
                            <p className="font-bold">No active items found</p>
                            <p className="text-xs mt-1">Try adjusting your search query</p>
                        </div>
                    )}
                    {loading && (
                        <MarketsScreenSkeleton />
                    )}
                    {error && (
                        <div className="text-sm text-rose-500 bg-rose-50 p-4 rounded-xl text-center border border-rose-100">{error}</div>
                    )}
                </div>

                <div className="flex-1" />

            </div>
            <AppBottomNav />
        </div>
    );
};
