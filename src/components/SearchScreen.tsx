"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { apiGet, formatCurrency, timeAgo } from '@/src/lib/api-client';
import { getPreferredRegionId } from '@/src/lib/region-preference';

interface SearchScreenProps {
    readonly className?: string;
}

type SearchPayload = {
    items: Array<{ id: number; name: string; defaultUnit: string }>;
    markets: Array<{ id: number; name: string; regionId: number }>;
    reports: Array<{
        id: number;
        itemId: number;
        itemName: string;
        marketId: number;
        marketName: string;
        marketRegionId: number;
        price: string;
        currency: string;
        status: 'pending' | 'verified' | 'rejected';
        reportedAt: string;
    }>;
};

export const SearchScreen: React.FC<SearchScreenProps> = ({ className = '' }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get('query') ?? 'Eggs');
    const [result, setResult] = useState<SearchPayload | null>(null);
    const [sort, setSort] = useState<'cheapest' | 'latest'>('cheapest');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const nextQuery = searchParams.get('query');
        if (nextQuery) {
            setQuery(nextQuery);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!query.trim()) {
            setResult({ items: [], markets: [], reports: [] });
            return;
        }

        const timeout = setTimeout(() => {
            const load = async () => {
                setLoading(true);
                setError(null);
                try {
                    const preferredRegionId = getPreferredRegionId();
                    const regionQuery = preferredRegionId ? `&regionId=${preferredRegionId}` : '';
                    const data = await apiGet<SearchPayload>(`/api/v1/search?query=${encodeURIComponent(query.trim())}&limit=20${regionQuery}`);
                    setResult(data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Search failed');
                } finally {
                    setLoading(false);
                }
            };

            void load();
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    const marketById = useMemo(() => {
        const map = new Map<number, { id: number; name: string; regionId: number }>();
        for (const market of result?.markets ?? []) {
            map.set(market.id, market);
        }
        return map;
    }, [result?.markets]);

    const itemById = useMemo(() => {
        const map = new Map<number, { id: number; name: string }>();
        for (const item of result?.items ?? []) {
            map.set(item.id, item);
        }
        return map;
    }, [result?.items]);

    const filteredReports = useMemo(() => {
        const reports = result?.reports ?? [];
        const base = verifiedOnly ? reports.filter((report) => report.status === 'verified') : reports;

        const sorted = [...base];
        if (sort === 'cheapest') {
            sorted.sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price));
        } else {
            sorted.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
        }
        return sorted;
    }, [result?.reports, sort, verifiedOnly]);

    const summary = useMemo(() => {
        if (filteredReports.length === 0) {
            return { avg: 0, best: 0, deltaPct: 0, isDown: false };
        }

        const prices = filteredReports.map((report) => Number.parseFloat(report.price)).filter((value) => Number.isFinite(value));
        if (prices.length === 0) {
            return { avg: 0, best: 0, deltaPct: 0, isDown: false };
        }

        const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const best = Math.min(...prices);
        const deltaPct = avg > 0 ? ((best - avg) / avg) * 100 : 0;
        return { avg, best, deltaPct, isDown: deltaPct < 0 };
    }, [filteredReports]);

    const itemSummary = useMemo(() => {
        const baseReports = filteredReports.length > 0 ? filteredReports : (result?.reports ?? []);
        const primaryItemId = result?.items[0]?.id ?? null;
        const itemReports = primaryItemId
            ? baseReports.filter((report) => report.itemId === primaryItemId)
            : baseReports;

        const latest = itemReports.length
            ? [...itemReports].sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())[0]
            : null;

        return {
            defaultUnit: result?.items[0]?.defaultUnit ?? 'unit',
            reports: itemReports.length,
            latestReportedAt: latest?.reportedAt ?? null,
        };
    }, [filteredReports, query, result?.items, result?.reports]);

    useEffect(() => {
        setVisibleCount(5);
    }, [query, sort, verifiedOnly]);

    const visibleReports = useMemo(() => filteredReports.slice(0, visibleCount), [filteredReports, visibleCount]);

    return (
        <div className={`bg-[#f6f8f7] font-display text-[#1a2e21] antialiased min-h-screen pb-24 ${className}`}>
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
                <header className="sticky top-0 z-30 bg-[#f6f8f7]/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" onClick={() => router.back()}>
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <div className="flex-1 relative">
                        <input
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#17cf5a] focus:border-[#17cf5a] shadow-sm"
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search items or markets..."
                        />
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#17cf5a]/10 text-[#17cf5a] hover:bg-[#17cf5a]/20 transition-colors">
                        <span className="material-symbols-outlined text-xl">tune</span>
                    </button>
                </header>

                <section className="px-4 py-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">National Index</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-extrabold tracking-tight">{formatCurrency(summary.avg.toFixed(2))}</span>
                                <span className="text-xs font-semibold text-gray-400">Avg</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">
                                Unit: /{itemSummary.defaultUnit} • {itemSummary.reports} reports
                                {itemSummary.latestReportedAt ? ` • Updated ${timeAgo(itemSummary.latestReportedAt)}` : ''}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-1 mb-1">
                                <span className={`${summary.isDown ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'} px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5`}>
                                    <span className="material-symbols-outlined text-[12px]">{summary.isDown ? 'trending_down' : 'trending_up'}</span>
                                    {summary.deltaPct >= 0 ? '+' : ''}{summary.deltaPct.toFixed(1)}%
                                </span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium">best vs average</div>
                        </div>
                    </div>
                </section>

                <section className="px-4 pb-2">
                    <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <button
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${sort === 'cheapest' ? 'bg-[#17cf5a] text-white shadow-lg shadow-[#17cf5a]/20' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                            onClick={() => setSort('cheapest')}
                        >
                            <span className="material-symbols-outlined text-base">savings</span>
                            Cheapest
                        </button>
                        <button
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${sort === 'latest' ? 'bg-[#17cf5a] text-white shadow-lg shadow-[#17cf5a]/20' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                            onClick={() => setSort('latest')}
                        >
                            <span className="material-symbols-outlined text-base">schedule</span>
                            Latest
                        </button>
                        <button
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${verifiedOnly ? 'bg-[#17cf5a] text-white shadow-lg shadow-[#17cf5a]/20' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                            onClick={() => setVerifiedOnly((current) => !current)}
                        >
                            <span className="material-symbols-outlined text-base">verified</span>
                            Verified Only
                        </button>
                    </div>
                </section>

                <main className="flex-1 px-4 py-2 space-y-3">
                    <div className="flex items-center justify-between px-1 py-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{filteredReports.length} Results Found</span>
                        {loading && <span className="text-xs font-bold text-[#17cf5a]">Searching...</span>}
                    </div>

                    {visibleReports.map((report, index) => (
                        <Link
                            href={`/price-index?itemId=${report.itemId}`}
                            key={report.id}
                            className={`bg-white rounded-xl p-4 shadow-sm relative overflow-hidden group block ${index === 0 && sort === 'cheapest' ? 'border border-[#17cf5a]/30' : 'border border-gray-100'}`}
                        >
                            {index === 0 && sort === 'cheapest' ? (
                                <div className="absolute top-0 right-0 bg-[#17cf5a] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                                    BEST PRICE
                                </div>
                            ) : null}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center p-2 border border-gray-100">
                                        <span className={`material-symbols-outlined text-2xl ${index === 0 && sort === 'cheapest' ? 'text-orange-500' : 'text-[#17cf5a]'}`}>storefront</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm leading-tight text-gray-900">{marketById.get(report.marketId)?.name ?? report.marketName}</h3>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                            <span className="material-symbols-outlined text-[14px]">distance</span>
                                            Region {marketById.get(report.marketId)?.regionId ?? report.marketRegionId ?? '-'} • {itemById.get(report.itemId)?.name ?? report.itemName}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1.5">
                                            {report.status === 'verified' ? (
                                                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                    <span className="material-symbols-outlined text-[10px]">verified</span> Verified
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                    Unverified
                                                </span>
                                            )}
                                            <span className="text-[10px] text-gray-400">{timeAgo(report.reportedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-lg font-extrabold ${index === 0 && sort === 'cheapest' ? 'text-[#17cf5a]' : 'text-gray-900'}`}>{formatCurrency(report.price, report.currency)}</div>
                                    {summary.best > 0 ? (
                                        <div className="flex justify-end mt-1">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${Number.parseFloat(report.price) <= summary.best ? 'text-red-500 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                                                {Number.parseFloat(report.price) <= summary.best ? 'BEST' : `+${(((Number.parseFloat(report.price) - summary.best) / summary.best) * 100).toFixed(0)}%`}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </Link>
                    ))}

                    {!loading && filteredReports.length === 0 && (
                        <div className="text-sm text-gray-500">No matching reports found.</div>
                    )}
                    {!loading && filteredReports.length > visibleReports.length && (
                        <button
                            className="w-full mt-1 py-3 rounded-xl border border-[#17cf5a]/20 bg-white text-[#17cf5a] font-bold text-sm hover:bg-[#17cf5a]/5 transition-colors"
                            onClick={() => setVisibleCount((current) => current + 5)}
                        >
                            Load more
                        </button>
                    )}
                    {error && (
                        <div className="text-sm text-red-500">{error}</div>
                    )}
                </main>
            </div>
        </div>
    );
};
