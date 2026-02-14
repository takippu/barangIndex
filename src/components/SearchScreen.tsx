"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { apiGet, formatCurrency, timeAgo } from '@/src/lib/api-client';
import { getPreferredRegionId } from '@/src/lib/region-preference';
import { DesktopHeader } from '@/src/components/DesktopHeader';
import { SearchScreenSkeleton } from '@/src/components/ui/Skeleton';

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

type Region = {
    id: number;
    name: string;
    slug: string;
};

export const SearchScreen: React.FC<SearchScreenProps> = ({ className = '' }) => {
    const router = useRouter();
    const searchParams = useSearchParams();



    const [regionId, setRegionId] = useState<number | null>(null);
    const [regions, setRegions] = useState<Region[]>([]);
    const [popularItems, setPopularItems] = useState<Array<{ id: number; name: string; defaultUnit: string }>>([]);

    useEffect(() => {
        setRegionId(getPreferredRegionId());

        // Fetch regions for displaying names
        const loadRegions = async () => {
            try {
                const data = await apiGet<Region[]>('/api/v1/regions');
                setRegions(data);
            } catch (err) {
                console.error('Failed to load regions', err);
            }
        };
        void loadRegions();

        // Fetch popular items for default suggestions
        const loadPopularItems = async () => {
            try {
                const data = await apiGet<Array<{ id: number; name: string; defaultUnit: string }>>('/api/v1/items?limit=8');
                setPopularItems(data);
            } catch (err) {
                console.error('Failed to load popular items', err);
            }
        };
        void loadPopularItems();
    }, []);
    const [query, setQuery] = useState(searchParams.get('query') ?? '');
    const [result, setResult] = useState<SearchPayload | null>(null);
    const [sort, setSort] = useState<'cheapest' | 'latest'>('cheapest');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
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
            // Sync query to URL so browser back button preserves search context
            const currentUrlQuery = searchParams.get('query') ?? '';
            if (query.trim() !== currentUrlQuery) {
                router.replace(`/search?query=${encodeURIComponent(query.trim())}`, { scroll: false });
            }

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
    }, [query, router, searchParams]);

    const marketById = useMemo(() => {
        const map = new Map<number, { id: number; name: string; regionId: number }>();
        for (const market of result?.markets ?? []) {
            map.set(market.id, market);
        }
        return map;
    }, [result?.markets]);

    const regionNameById = useMemo(() => {
        const map = new Map<number, string>();
        for (const r of regions) {
            map.set(r.id, r.name);
        }
        return map;
    }, [regions]);

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
        const primaryItem = result?.items[0] ?? null;

        // Find all item IDs that match the primary item's name and unit (handling duplicates)
        const relevantItemIds = new Set<number>();
        if (primaryItem) {
            for (const item of result?.items ?? []) {
                if (item.name === primaryItem.name && item.defaultUnit === primaryItem.defaultUnit) {
                    relevantItemIds.add(item.id);
                }
            }
        }

        const itemReports = primaryItem
            ? baseReports.filter((report) => relevantItemIds.has(report.itemId))
            : baseReports;

        const latest = itemReports.length
            ? [...itemReports].sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())[0]
            : null;

        return {
            defaultUnit: primaryItem?.defaultUnit ?? 'unit',
            reports: itemReports.length,
            latestReportedAt: latest?.reportedAt ?? null,
        };
    }, [filteredReports, query, result?.items, result?.reports]);

    useEffect(() => {
        setVisibleCount(5);
    }, [query, sort, verifiedOnly]);

    const visibleReports = useMemo(() => filteredReports.slice(0, visibleCount), [filteredReports, visibleCount]);
    const searchSuggestions = useMemo(() => {
        const itemSuggestions = (result?.items ?? []).slice(0, 4).map((item) => ({
            key: `item-${item.id}`,
            type: 'item' as const,
            label: item.name,
            subLabel: `Item • /${item.defaultUnit}`,
            value: String(item.id),
        }));
        const marketSuggestions = (result?.markets ?? []).slice(0, 4).map((market) => ({
            key: `market-${market.id}`,
            type: 'market' as const,
            label: market.name,
            subLabel: `Market • Region ${market.regionId}`,
            value: String(market.id),
        }));
        const reportItemSuggestions = Array.from(
            new Set((result?.reports ?? []).map((report) => report.itemName).filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))),
        ).slice(0, 3).map((name, index) => ({
            key: `report-item-${index}-${name}`,
            type: 'item' as const,
            label: name,
            subLabel: 'Item from recent reports',
            value: name,
        }));
        return [...itemSuggestions, ...reportItemSuggestions, ...marketSuggestions].slice(0, 8);
    }, [query, result?.items, result?.markets, result?.reports]);

    return (
        <div className={`bg-slate-50 font-sans text-slate-900 antialiased min-h-screen ${className}`}>
            <DesktopHeader activeNav="/search" showSubmitButton={false} />

            <div className="max-w-md mx-auto lg:max-w-7xl lg:px-6 min-h-screen flex flex-col relative">
                <div className="lg:bg-white lg:rounded-3xl lg:shadow-xl lg:shadow-slate-200/50 lg:border lg:border-slate-100 lg:mt-6 lg:overflow-hidden">
                    {/* Desktop Header with Search */}
                    <div className="hidden lg:block px-8 py-6 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => router.back()}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
                                >
                                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Search</h1>
                                    <p className="text-sm text-slate-500">Find prices across markets</p>
                                </div>
                            </div>
                            <div className="flex-1 max-w-xl relative">
                                <input
                                    className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 placeholder-slate-400 transition-all outline-none"
                                    type="text"
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value);
                                        setShowSearchDropdown(true);
                                    }}
                                    onFocus={() => setShowSearchDropdown(true)}
                                    onBlur={() => {
                                        setTimeout(() => setShowSearchDropdown(false), 120);
                                    }}
                                    placeholder="Search items or markets..."
                                />
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                {query.trim().length > 0 && (
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => {
                                            setQuery('');
                                            setShowSearchDropdown(true);
                                            router.replace('/search', { scroll: false });
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-[16px] text-slate-600">close</span>
                                    </button>
                                )}
                                {showSearchDropdown && query.trim().length > 0 ? (
                                    <div className="absolute left-0 right-0 mt-2 z-40 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden ring-1 ring-slate-900/5">
                                        {searchSuggestions.length > 0 ? (
                                            searchSuggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion.key}
                                                    type="button"
                                                    className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0 group"
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => {
                                                        if (suggestion.type === 'market') {
                                                            router.push(`/markets/${suggestion.value}`);
                                                        } else {
                                                            setQuery(suggestion.label);
                                                            router.replace(`/search?query=${encodeURIComponent(suggestion.label)}`);
                                                        }
                                                        setShowSearchDropdown(false);
                                                    }}
                                                >
                                                    <p className="text-sm font-bold text-slate-700 group-hover:text-primary-700 transition-colors truncate">{suggestion.label}</p>
                                                    <p className="text-[11px] text-slate-400">{suggestion.subLabel}</p>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-slate-500 italic">{loading ? 'Searching...' : 'No matching options'}</div>
                                        )}
                                    </div>
                                ) : null}
                                {showSearchDropdown && query.trim().length === 0 && popularItems.length > 0 ? (
                                    <div className="absolute left-0 right-0 mt-2 z-40 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden ring-1 ring-slate-900/5">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Popular Items</p>
                                        </div>
                                        {popularItems.map((item) => (
                                            <button
                                                key={`popular-${item.id}`}
                                                type="button"
                                                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0 group"
                                                onMouseDown={(event) => event.preventDefault()}
                                                onClick={() => {
                                                    setQuery(item.name);
                                                    router.replace(`/search?query=${encodeURIComponent(item.name)}`);
                                                    setShowSearchDropdown(false);
                                                }}
                                            >
                                                <p className="text-sm font-bold text-slate-700 group-hover:text-primary-700 transition-colors truncate">{item.name}</p>
                                                <p className="text-[11px] text-slate-400">Item • /{item.defaultUnit}</p>
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Header */}
                    <header className="lg:hidden z-30 bg-slate-50 px-4 py-3 flex items-center gap-3 border-b border-slate-200/50">
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-soft hover:bg-slate-50 transition-colors text-slate-600" onClick={() => router.back()}>
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </button>
                        <div className="flex-1 relative">
                            <input
                                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-soft placeholder-slate-400 transition-all outline-none"
                                type="text"
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setShowSearchDropdown(true);
                                }}
                                onFocus={() => setShowSearchDropdown(true)}
                                onBlur={() => {
                                    setTimeout(() => setShowSearchDropdown(false), 120);
                                }}
                                placeholder="Search items or markets..."
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            {query.trim().length > 0 && (
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => {
                                        setQuery('');
                                        setShowSearchDropdown(true);
                                        router.replace('/search', { scroll: false });
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[14px] text-slate-600">close</span>
                                </button>
                            )}
                            {showSearchDropdown && query.trim().length > 0 ? (
                                <div className="absolute left-0 right-0 mt-2 z-40 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden ring-1 ring-slate-900/5">
                                    {searchSuggestions.length > 0 ? (
                                        searchSuggestions.map((suggestion) => (
                                            <button
                                                key={suggestion.key}
                                                type="button"
                                                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0 group"
                                                onMouseDown={(event) => event.preventDefault()}
                                                onClick={() => {
                                                    if (suggestion.type === 'market') {
                                                        router.push(`/markets/${suggestion.value}`);
                                                    } else {
                                                        setQuery(suggestion.label);
                                                        router.replace(`/search?query=${encodeURIComponent(suggestion.label)}`);
                                                    }
                                                    setShowSearchDropdown(false);
                                                }}
                                            >
                                                <p className="text-sm font-bold text-slate-700 group-hover:text-primary-700 transition-colors truncate">{suggestion.label}</p>
                                                <p className="text-[11px] text-slate-400">{suggestion.subLabel}</p>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-slate-500 italic">{loading ? 'Searching...' : 'No matching options'}</div>
                                    )}
                                </div>
                            ) : null}
                            {showSearchDropdown && query.trim().length === 0 && popularItems.length > 0 ? (
                                <div className="absolute left-0 right-0 mt-2 z-40 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden ring-1 ring-slate-900/5">
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Popular Items</p>
                                    </div>
                                    {popularItems.map((item) => (
                                        <button
                                            key={`popular-${item.id}`}
                                            type="button"
                                            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0 group"
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => {
                                                setQuery(item.name);
                                                router.replace(`/search?query=${encodeURIComponent(item.name)}`);
                                                setShowSearchDropdown(false);
                                            }}
                                        >
                                            <p className="text-sm font-bold text-slate-700 group-hover:text-primary-700 transition-colors truncate">{item.name}</p>
                                            <p className="text-[11px] text-slate-400">Item • /{item.defaultUnit}</p>
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </header>

                    <section className="px-4 py-4">
                        <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-primary-50/50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Search Overview</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">{formatCurrency(summary.avg.toFixed(2))}</span>
                                    <span className="text-xs font-semibold text-slate-400">Avg Price</span>
                                    <span className={`text-sm font-bold flex items-center gap-0.5 ${summary.deltaPct > 0 ? 'text-rose-600' :
                                        summary.deltaPct < 0 ? 'text-emerald-600' :
                                            'text-slate-500'
                                        }`}>
                                        <span className="material-symbols-outlined text-[16px]">
                                            {summary.deltaPct > 0 ? 'trending_up' : summary.deltaPct < 0 ? 'trending_down' : 'remove'}
                                        </span>
                                        {summary.deltaPct === 0 ? '~' : `${summary.deltaPct > 0 ? '+' : ''}${summary.deltaPct.toFixed(1)}%`}
                                        <span className="text-[10px] font-medium text-slate-400 ml-0.5">vs Avg</span>
                                    </span>
                                </div>

                                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                                    Unit: /{itemSummary.defaultUnit} • {itemSummary.reports} reports
                                    {itemSummary.latestReportedAt ? ` • Updated ${timeAgo(itemSummary.latestReportedAt)}` : ''}
                                </p>
                            </div>
                            <div className="text-right relative z-10">
                                {/* Removed redundant badge & label */}
                            </div>
                        </div>
                    </section>

                    <section className="px-4 pb-4">
                        <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <button
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${sort === 'cheapest' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                                onClick={() => setSort('cheapest')}
                            >
                                <span className="material-symbols-outlined text-base">savings</span>
                                Cheapest
                            </button>
                            <button
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${sort === 'latest' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                                onClick={() => setSort('latest')}
                            >
                                <span className="material-symbols-outlined text-base">schedule</span>
                                Latest
                            </button>
                            <button
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${verifiedOnly ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                                onClick={() => setVerifiedOnly((current) => !current)}
                            >
                                <span className="material-symbols-outlined text-base">verified</span>
                                Verified Only
                            </button>
                            {regionId ? (
                                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border bg-blue-50 border-blue-100 text-blue-600">
                                    <span className="material-symbols-outlined text-base">location_on</span>
                                    {regionNameById.get(regionId) || `Region ${regionId}`}
                                </div>
                            ) : null}
                        </div>
                    </section>

                    <main className="flex-1 px-4 pb-4 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{filteredReports.length} Results Found</span>
                            {loading && <span className="text-xs font-bold text-primary-600 animate-pulse">Searching...</span>}
                        </div>

                        {loading && filteredReports.length === 0 && <SearchScreenSkeleton />}

                        {visibleReports.map((report, index) => {
                            const isCheapest = index === 0 && sort === 'cheapest';
                            const price = Number.parseFloat(report.price);
                            const pctDiff = summary.best > 0 ? ((price - summary.best) / summary.best) * 100 : 0;
                            const isNearBest = pctDiff < 1;

                            return (
                                <Link
                                    href={`/markets/${report.marketId}?itemId=${report.itemId}`}
                                    key={report.id}
                                    className="bg-white rounded-2xl p-4 shadow-soft relative overflow-hidden group block transition-all hover:shadow-md border border-slate-100"
                                >
                                    {isCheapest ? (
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm">
                                            BEST PRICE
                                        </div>
                                    ) : null}
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-3 flex-1 min-w-0">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center p-2 border shrink-0 ${isCheapest ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                                <span className={`material-symbols-outlined text-2xl`}>storefront</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-sm leading-tight text-slate-900 mb-1 truncate">{marketById.get(report.marketId)?.name ?? report.marketName}</h3>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                                                    <span className="material-symbols-outlined text-[14px] shrink-0">distance</span>
                                                    <span className="truncate">{(() => {
                                                        const rId = marketById.get(report.marketId)?.regionId ?? report.marketRegionId;
                                                        const rName = rId ? (regionNameById.get(rId) || `Region ${rId}`) : '-';
                                                        return `${rName} • ${itemById.get(report.itemId)?.name ?? report.itemName}`;
                                                    })()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {report.status === 'verified' ? (
                                                        <span className="text-[10px] font-bold text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                            <span className="material-symbols-outlined text-[12px]">verified</span> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                                            Unverified
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-slate-400 font-medium">{timeAgo(report.reportedAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex flex-col items-end">
                                            <div className={`text-lg font-extrabold tabular-nums tracking-tight whitespace-nowrap ${isCheapest ? 'text-emerald-600' : 'text-slate-900'}`}>{formatCurrency(report.price, report.currency)}</div>
                                            {summary.best > 0 && !isCheapest && (
                                                <div className="mt-1">
                                                    {isNearBest ? (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
                                                            ~
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg inline-flex items-center gap-0.5 text-rose-600 bg-rose-50 border border-rose-100">
                                                            +{pctDiff.toFixed(0)}% <span className="font-medium opacity-70">vs best</span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}

                        {!loading && filteredReports.length === 0 && (
                            <div className="text-sm text-slate-500 text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="font-bold">No matching reports found.</p>
                                <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                            </div>
                        )}
                        {!loading && filteredReports.length > visibleReports.length && (
                            <button
                                className="w-full mt-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
                                onClick={() => setVisibleCount((current) => current + 5)}
                            >
                                Load more results
                            </button>
                        )}
                        {error && (
                            <div className="text-sm text-rose-500 bg-rose-50 p-4 rounded-xl text-center border border-rose-100">{error}</div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};
