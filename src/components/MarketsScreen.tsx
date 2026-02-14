"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { apiGet, formatCurrency, timeAgo } from '@/src/lib/api-client';
import { getItemIcon } from '@/src/lib/item-icons';
import { getPreferredRegionId } from '@/src/lib/region-preference';

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
        <div className={`bg-[#f6f8f7] font-display text-[#1a2e21] antialiased min-h-screen pb-24 ${className}`}>
            <div className="max-w-md mx-auto min-h-screen flex flex-col">

                {/* Header */}
                <header className="sticky top-0 z-20 bg-[#f6f8f7]/95 backdrop-blur-md px-4 pt-6 pb-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#1a2e21]">Items Overview</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">Browse tracked items from community reports</p>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-[#17cf5a]">
                        <span className="material-symbols-outlined">filter_list</span>
                    </button>
                </header>

                <section className="px-4 pb-3">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#17cf5a]/10 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#17cf5a]/50 focus:border-[#17cf5a] placeholder-gray-400 outline-none shadow-sm transition-all"
                            placeholder="Search item name..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                </section>

                {/* Cards Container */}
                <div className="px-4 space-y-3">
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
                            className="bg-white p-4 rounded-2xl shadow-sm border border-[#17cf5a]/10 active:scale-[0.98] transition-all cursor-pointer"
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-3 mb-4 border-b border-gray-50 pb-3">
                                <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#17cf5a]/10 flex items-center justify-center text-[#17cf5a] shrink-0">
                                    <span className="text-xl">{getItemIcon(item.name, item.category)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-base text-[#1a2e21] truncate">{item.name}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.category}</div>
                                </div>
                                </div>
                                <div className="text-right shrink-0 min-w-[96px]">
                                    <p className="text-lg leading-tight font-extrabold text-[#1a2e21]">
                                        {formatCurrency(trend?.latestPrice ?? 0, item.currency)}
                                    </p>
                                    <p className="text-[10px] text-gray-500">Latest</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 items-stretch">
                                <div className="p-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Unit</p>
                                    <span className="font-semibold text-sm text-[#1a2e21]">/{item.defaultUnit}</span>
                                </div>
                                <div className="p-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">30D Trend</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
                                        trendUp ? 'text-red-500 bg-red-50' : 'text-green-600 bg-green-50'
                                    }`}>
                                        <span className="material-symbols-outlined text-[12px]">{trendUp ? 'trending_up' : 'trending_down'}</span>
                                        {Number.isFinite(trendPct) ? `${trendPct >= 0 ? '+' : ''}${trendPct.toFixed(1)}%` : '0.0%'}
                                    </span>
                                </div>
                                <div className="p-2 text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Reports</p>
                                    <span className="font-bold text-sm text-[#17cf5a]">{trend?.reportCount ?? 0}</span>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                                    {trend?.latestReportedAt ? `Updated ${timeAgo(trend.latestReportedAt)}` : 'No recent updates'}
                                </div>
                                <span className="text-xs font-bold text-[#17cf5a]">View market options</span>
                            </div>
                        </div>
                            );
                        })()
                    ))}
                    {!loading && items.length === 0 && (
                        <div className="text-sm text-gray-500 px-2">No active items found.</div>
                    )}
                    {loading && (
                        <div className="text-sm text-gray-500 px-2">Loading items...</div>
                    )}
                    {error && (
                        <div className="text-sm text-red-500 px-2">{error}</div>
                    )}
                </div>

            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-[#17cf5a]/10 px-6 py-3 flex justify-between items-center z-30">
                <Link href="/home" className="flex flex-col items-center gap-1 group">
                    <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-[#17cf5a] transition-colors">storefront</span>
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#17cf5a] transition-colors">Home</span>
                </Link>
                <Link href="/markets" className="flex flex-col items-center gap-1 group">
                    <span className="material-symbols-outlined text-2xl text-[#17cf5a] transition-colors">bar_chart</span>
                    <span className="text-[10px] font-bold text-[#17cf5a] transition-colors">Items</span>
                </Link>
                <div className="relative -top-6">
                    <Link href="/submit" className="w-14 h-14 bg-[#17cf5a] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#17cf5a]/40 hover:scale-110 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </Link>
                </div>
                <button className="flex flex-col items-center gap-1 group">
                    <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-[#17cf5a] transition-colors">notifications</span>
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#17cf5a] transition-colors">Alerts</span>
                </button>
                <Link href="/profile" className="flex flex-col items-center gap-1 group">
                    <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-[#17cf5a] transition-colors">person</span>
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#17cf5a] transition-colors">Profile</span>
                </Link>
            </nav>
        </div>
    );
};
