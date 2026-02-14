"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { apiGet, formatCurrency, timeAgo } from '@/src/lib/api-client';
import { getItemIcon } from '@/src/lib/item-icons';
import { getPreferredRegionId } from '@/src/lib/region-preference';
import { ClientBottomNav } from '@/src/components/ClientBottomNav';
import { DesktopHeader, PublicDesktopHeader } from '@/src/components/DesktopHeader';
import { MarketsScreenSkeleton } from '@/src/components/ui/Skeleton';

interface MarketsScreenProps {
    readonly className?: string;
    readonly user?: {
        name: string | null;
        email: string;
        image?: string | null;
    } | null;
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

export const MarketsScreen: React.FC<MarketsScreenProps> = ({ className = '', user }) => {
    const isAuthenticated = !!user;
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
        <div className={`bg-slate-50 font-sans text-slate-900 antialiased min-h-screen ${className}`}>
            {isAuthenticated ? <DesktopHeader activeNav="/markets" /> : <PublicDesktopHeader />}
            
            <div className="max-w-md mx-auto lg:max-w-7xl lg:px-6 min-h-screen flex flex-col relative">
                <div className="lg:bg-white lg:rounded-3xl lg:shadow-xl lg:shadow-slate-200/50 lg:border lg:border-slate-100 lg:mt-6 lg:overflow-hidden">
                    {/* Mobile Header */}
                    <header className="lg:hidden sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl px-4 pt-6 pb-4 border-b border-slate-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Market Overview</h1>
                                <p className="text-sm text-slate-500 font-medium mt-1">Real-time prices from community reports</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                                <span className="material-symbols-outlined">storefront</span>
                            </div>
                        </div>
                    </header>

                    {/* Desktop Header */}
                    <div className="hidden lg:block px-8 py-6 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Market Overview</h1>
                                <p className="text-slate-500 mt-1">Browse real-time prices from community reports across all markets</p>
                            </div>
                            <Link 
                                href={isAuthenticated ? "/submit" : "/login"} 
                                className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Submit a Price
                            </Link>
                        </div>
                    </div>

                    <section className="px-4 lg:px-8 pb-4 pt-4 lg:pt-6">
                        <div className="relative max-w-md">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                className="w-full pl-10 pr-4 py-3 bg-white lg:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 placeholder-slate-400 outline-none transition-all"
                                placeholder="Search item name..."
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                            />
                        </div>
                    </section>

                    {/* Cards Container */}
                    <div className="px-4 lg:px-8 pb-4 lg:grid lg:grid-cols-2 lg:gap-4">
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
                                        className="bg-white lg:border lg:border-slate-100 p-4 rounded-2xl shadow-soft lg:shadow-none active:scale-[0.99] transition-all cursor-pointer hover:shadow-md group mb-3 lg:mb-0"
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                    {getItemIcon(item.name, item.category)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 leading-tight">{item.name}</h3>
                                                    <p className="text-xs text-slate-400 font-medium capitalize">{item.category}</p>
                                                </div>
                                            </div>
                                            {trend?.latestPrice && (
                                                <div className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${trendUp ? 'text-rose-600 bg-rose-50' : trendPct < 0 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}>
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        {trendUp ? 'trending_up' : trendPct < 0 ? 'trending_down' : 'remove'}
                                                    </span>
                                                    {trendPct === 0 ? '~' : `${trendUp ? '+' : ''}${Math.abs(trendPct).toFixed(1)}%`}
                                                </div>
                                            )}
                                        </div>

                                        {/* Price Info */}
                                        <div className="flex items-end justify-between mb-3">
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Latest Price</p>
                                                <p className="text-2xl font-extrabold text-slate-900">
                                                    {trend?.latestPrice ? formatCurrency(trend.latestPrice) : '-'}
                                                    <span className="text-sm font-semibold text-slate-400 ml-1">/{item.defaultUnit}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Avg (30d)</p>
                                                <p className="text-lg font-bold text-slate-600">
                                                    {formatCurrency(trend?.avgPrice ?? '0')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Footer Info */}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                {trend?.latestReportedAt ? `Updated ${timeAgo(trend.latestReportedAt)}` : 'No recent updates'}
                                            </div>
                                            <span className="text-xs font-bold text-sky-600 flex items-center gap-1 group-hover:text-sky-700 transition-colors">
                                                View details <span className="material-symbols-outlined text-base">arrow_forward</span>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()
                        ))}
                        {!loading && items.length === 0 && (
                            <div className="lg:col-span-2 text-sm text-slate-500 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inventory_2</span>
                                <p className="font-bold">No active items found</p>
                                <p className="text-xs mt-1">Try adjusting your search query</p>
                            </div>
                        )}
                        {loading && (
                            <div className="lg:col-span-2">
                                <MarketsScreenSkeleton />
                            </div>
                        )}
                        {error && (
                            <div className="lg:col-span-2 text-sm text-rose-500 bg-rose-50 p-4 rounded-xl text-center border border-rose-100">{error}</div>
                        )}
                    </div>

                    <div className="flex-1" />
                </div>
            </div>
            
            <ClientBottomNav />
        </div>
    );
};
