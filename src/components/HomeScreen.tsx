"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { apiGet, apiPost, apiDelete, formatCurrency, timeAgo } from '@/src/lib/api-client';
import { getItemIcon } from '@/src/lib/item-icons';
import { SearchableSelect } from '@/src/components/ui/SearchableSelect';
import { getPreferredRegionId, setPreferredRegionId } from '@/src/lib/region-preference';
import { AppBottomNav } from '@/src/components/AppBottomNav';
import { DesktopDashboard } from '@/src/components/DesktopDashboard';
import { CommentDrawer } from '@/src/components/ui/CommentDrawer';
import { InfoTooltip } from '@/src/components/ui/InfoTooltip';

interface HomeScreenProps {
    readonly className?: string;
    readonly feed?: FeedRow[];
    readonly items?: Item[];
    readonly regions?: RegionOption[];
    readonly pulse?: PulsePayload | null;
    readonly user?: any; // Added user prop to interface
}

type Item = {
    id: number;
    slug: string;
    name: string;
    category: string;
    defaultUnit: string;
    currency: string;
};

type FeedRow = {
    id: number;
    itemId: number;
    itemName: string;
    marketName: string;
    price: string;
    status: 'pending' | 'verified' | 'rejected';
    reportedAt: string;
    helpfulCount: number;
    hasHelpfulVote: boolean;
    commentCount: number;
    reporterName: string | null;
};

type RegionOption = {
    id: number;
    name: string;
};

type PulsePayload = {
    region: { id: number | null; name: string };
    days: number;
    totals: {
        totalReports: number;
        verifiedReports: number;
        pendingReports: number;
        activeMarkets: number;
        activeContributors: number;
        lastReportedAt: string | null;
    };
    series: Array<{
        date: string;
        reports: number;
        verifiedReports: number;
    }>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ feed: initialFeed = [], items: initialItems = [], regions: initialRegions = [], pulse: initialPulse = null, user = null }) => {
    const router = useRouter();
    const [feed, setFeed] = useState<FeedRow[]>(initialFeed);
    const [items, setItems] = useState<Item[]>(initialItems);
    const [regions, setRegions] = useState<RegionOption[]>(initialRegions);
    const [selectedRegionId, setSelectedRegionId] = useState<number | null>(() => getPreferredRegionId());
    const [pulse, setPulse] = useState<PulsePayload | null>(initialPulse);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCommentReportId, setActiveCommentReportId] = useState<number | null>(null);
    const [itemTrends, setItemTrends] = useState<Record<number, { latestPrice: string | null; avgPrice: string; reportCount: number }>>({});

    useEffect(() => {
        let mounted = true;

        const loadInitial = async () => {
            try {
                const [itemRows, marketRows] = await Promise.all([
                    apiGet<Item[]>('/api/v1/items?limit=100'),
                    apiGet<Array<{ regionId: number; regionName: string }>>('/api/v1/markets'),
                ]);

                if (!mounted) return;
                setItems(itemRows);
                const uniqueRegions = Array.from(
                    new Map(marketRows.map((row) => [row.regionId, { id: row.regionId, name: row.regionName }])).values(),
                );
                setRegions(uniqueRegions);
                // Find potential default region (Klang Valley)
                const preferredRegionId = getPreferredRegionId();
                const klangValley = uniqueRegions.find((region) => region.name.toLowerCase().includes('klang'));

                // Priority: Saved Preference -> Klang Valley -> First Available -> Null
                let initialRegionId: number | null = null;

                if (preferredRegionId && uniqueRegions.some((region) => region.id === preferredRegionId)) {
                    initialRegionId = preferredRegionId;
                } else if (klangValley) {
                    initialRegionId = klangValley.id;
                } else if (uniqueRegions.length > 0) {
                    initialRegionId = uniqueRegions[0].id;
                }

                setSelectedRegionId(initialRegionId);

                // Note: Trends are now fetched in the loadAreaData effect which triggers when selectedRegionId is set
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load home data');
            }
        };

        void loadInitial();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        setPreferredRegionId(selectedRegionId);
    }, [selectedRegionId]);

    useEffect(() => {
        let mounted = true;
        const loadAreaData = async () => {
            setLoading(true);
            setError(null);
            try {
                const regionQuery = selectedRegionId ? `&regionId=${selectedRegionId}` : '';

                // Fetch feed, pulse, and trends together
                const [feedResponse, pulseResponse] = await Promise.all([
                    apiGet<{ data: FeedRow[] }>(`/api/v1/price-reports/feed?limit=12${regionQuery}`),
                    apiGet<PulsePayload>(`/api/v1/community/pulse?days=30${regionQuery}`),
                ]);

                if (!mounted) return;
                setFeed(feedResponse.data);
                setPulse(pulseResponse);
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load area data');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void loadAreaData();
        return () => {
            mounted = false;
        };
    }, [selectedRegionId]);

    // Separate effect for trends to depend on items being loaded
    useEffect(() => {
        if (items.length === 0) return;

        let mounted = true;
        const loadTrends = async () => {
            try {
                const regionQuery = selectedRegionId ? `&regionId=${selectedRegionId}` : '';

                // We'll fetch trends for the first 20 items to simulate "scanning" for movers without overloading
                const trendSnapshots = await Promise.all(
                    items.slice(0, 20).map(async (item) => {
                        try {
                            const priceIndex = await apiGet<{
                                stats: {
                                    latestPrice: string | null;
                                    avgPrice: string;
                                    reportCount: number;
                                };
                            }>(`/api/v1/price-index/${item.id}?timeframe=30d${regionQuery}`);

                            return [
                                item.id,
                                {
                                    latestPrice: priceIndex.stats.latestPrice,
                                    avgPrice: priceIndex.stats.avgPrice,
                                    reportCount: priceIndex.stats.reportCount,
                                },
                            ] as const;
                        } catch {
                            return null;
                        }
                    })
                );

                if (mounted) {
                    const validTrends = trendSnapshots.filter((t): t is [number, { latestPrice: string | null; avgPrice: string; reportCount: number }] => t !== null);
                    if (validTrends.length > 0) {
                        setItemTrends(Object.fromEntries(validTrends));
                    }
                }
            } catch {
                // Silent fail for trends
            }
        };

        void loadTrends();
        return () => {
            mounted = false;
        };
    }, [items, selectedRegionId]);



    const { mostContributed, biggestDrops } = useMemo(() => {
        if (Object.keys(itemTrends).length === 0) {
            return { mostContributed: [], biggestDrops: [] };
        }

        const enrichedItems = items.map((item) => {
            const trendData = itemTrends[item.id];
            if (!trendData || !trendData.latestPrice) return null;

            const latestPrice = Number.parseFloat(trendData.latestPrice);
            const avgPrice = Number.parseFloat(trendData.avgPrice);
            const reportCount = trendData.reportCount;

            const trendPct = avgPrice > 0 ? ((latestPrice - avgPrice) / avgPrice) * 100 : 0;
            const trend = trendPct > 0 ? 'up' : trendPct < 0 ? 'down' : 'neutral';

            return {
                id: item.id,
                name: item.name,
                price: formatCurrency(latestPrice.toString(), item.currency),
                unit: `/${item.defaultUnit}`,
                icon: getItemIcon(item.name, item.category),
                trendPct,
                trend,
                reportCount,
                rawPrice: latestPrice
            };
        }).filter((i): i is NonNullable<typeof i> => i !== null);

        // Most Contributed: Sort by report count DESC
        const contributed = [...enrichedItems].sort((a, b) => b.reportCount - a.reportCount).slice(0, 5);

        // Biggest Drops: Top absolute drops (most negative)
        // Sort ascending because strict negative numbers (-20 < -5)
        const drops = enrichedItems
            .filter(i => i.trend === 'down')
            .sort((a, b) => a.trendPct - b.trendPct)
            .slice(0, 5);

        return { mostContributed: contributed, biggestDrops: drops };
    }, [items, itemTrends]);

    const recentActivity = useMemo(() => {
        return feed.slice(0, 5);
    }, [feed]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-primary-100 selection:text-primary-900">
            {/* Desktop Dashboard */}
            <div className="hidden lg:block">
                <DesktopDashboard
                    user={user}
                    pulse={pulse}
                    feed={feed}
                    items={items}
                    topMovers={[]} // Deprecated
                    mostContributed={mostContributed}
                    biggestDrops={biggestDrops}
                    regions={regions}
                    selectedRegionId={selectedRegionId}
                    onRegionChange={setSelectedRegionId}
                    setFeed={setFeed}
                    setActiveCommentReportId={setActiveCommentReportId}
                />
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden max-w-md mx-auto min-h-screen bg-white pb-24 relative">
                <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl px-4 pt-6 pb-2 border-b border-slate-200/50">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Grocery<span className="text-emerald-600">Index</span></h1>
                            <p className="text-xs text-slate-500 font-medium">Community Price Tracker</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <SearchableSelect
                                options={regions.map(r => ({ value: r.id, label: r.name }))}
                                placeholder="Area"
                                value={selectedRegionId}
                                onChange={(val) => setSelectedRegionId(val)}
                                label="Region"
                                showLabel={false}
                                variant="minimal"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/60 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder-slate-400 outline-none shadow-soft transition-all"
                            placeholder="Search items..."
                            type="text"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const value = e.currentTarget.value.trim();
                                    if (value) {
                                        router.push(`/search?query=${encodeURIComponent(value)}`);
                                    }
                                }
                            }}
                        />
                    </div>
                </header>

                <main className="space-y-6 pt-6">
                    {/* Community Pulse */}
                    <section className="px-4">
                        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-soft relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Community Pulse</h3>
                                        <p className="text-lg font-extrabold leading-tight">
                                            {pulse ? `${pulse.totals.totalReports.toLocaleString()} Reports` : 'Loading...'}
                                            <span className="text-xs font-semibold text-slate-400 ml-1.5">30d</span>
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                                        <span className="material-symbols-outlined text-emerald-400">monitoring</span>
                                    </div>
                                </div>

                                {/* 30-Day Line Chart */}
                                {(() => {
                                    const series = pulse?.series ?? [];
                                    if (series.length === 0) {
                                        return (
                                            <div className="flex items-center justify-center h-24 mt-2 text-xs text-slate-500">
                                                No data available
                                            </div>
                                        );
                                    }

                                    const values = series.map(s => s.reports);
                                    const maxVal = Math.max(...values, 1);
                                    const chartW = 280;
                                    const chartH = 80;
                                    const padding = 2;

                                    const points = values.map((v, i) => {
                                        const x = padding + (i / Math.max(values.length - 1, 1)) * (chartW - padding * 2);
                                        const y = chartH - padding - (v / maxVal) * (chartH - padding * 2);
                                        return { x, y };
                                    });

                                    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                                    const areaPath = `${linePath} L${points[points.length - 1].x},${chartH} L${points[0].x},${chartH} Z`;

                                    const formatLabel = (dateStr: string) => {
                                        const d = new Date(dateStr);
                                        return `${d.getDate()}/${d.getMonth() + 1}`;
                                    };

                                    return (
                                        <>
                                            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-24 mt-2" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                                                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
                                                    </linearGradient>
                                                </defs>
                                                <path d={areaPath} fill="url(#pulseGrad)" />
                                                <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                                                <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="#10B981" stroke="#0f172a" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                                            </svg>
                                            <div className="flex justify-between mt-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <span>{formatLabel(series[0].date)}</span>
                                                <span>{formatLabel(series[Math.floor(series.length / 2)].date)}</span>
                                                <span>{formatLabel(series[series.length - 1].date)}</span>
                                            </div>
                                        </>
                                    );
                                })()}

                                {/* Pulse Stats Row */}
                                {pulse && (
                                    <div className="flex gap-3 mt-3 pt-3 border-t border-white/10">
                                        <div className="flex-1 text-center">
                                            <p className="text-lg font-extrabold text-emerald-400 tabular-nums">{pulse.totals.verifiedReports}</p>
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Verified</p>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <p className="text-lg font-extrabold text-amber-400 tabular-nums">{pulse.totals.pendingReports}</p>
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <p className="text-lg font-extrabold text-emerald-400 tabular-nums">{pulse.totals.activeContributors}</p>
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Contributors</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Most Contributed by Community */}
                    <section className="mb-5">
                        <div className="px-4 flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-amber-500 text-lg">local_fire_department</span>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Most Contributed</h3>
                                <InfoTooltip text="Items with the most price reports from the community in the last 30 days." />
                            </div>
                            <Link href="/markets" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
                                More <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </Link>
                        </div>
                        <div className="flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide">
                            {mostContributed.map((item, idx) => (
                                <Link href={`/price-index?itemId=${item.id}`} key={item.id} className="min-w-[148px] bg-white p-3.5 rounded-2xl border border-slate-100 shadow-soft flex flex-col hover:shadow-md transition-all group shrink-0">
                                    <div className="flex items-start justify-between mb-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">{item.icon}</div>
                                        {idx === 0 ? (
                                            <span className="material-symbols-outlined text-amber-400 text-xl" title="#1 Most Contributed">emoji_events</span>
                                        ) : idx === 1 ? (
                                            <span className="material-symbols-outlined text-slate-400 text-xl" title="#2 Most Contributed">emoji_events</span>
                                        ) : idx === 2 ? (
                                            <span className="material-symbols-outlined text-amber-700 text-xl" title="#3 Most Contributed">emoji_events</span>
                                        ) : (
                                            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-lg inline-flex items-center gap-0.5 text-slate-500 bg-slate-100">
                                                #{idx + 1}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-slate-600 leading-tight mb-0.5 line-clamp-1">{item.name}</p>
                                    <p className="text-base font-extrabold text-slate-900 tabular-nums">{item.price}<span className="text-[10px] font-semibold text-slate-400 ml-0.5">{item.unit}</span></p>
                                </Link>
                            ))}
                            {mostContributed.length === 0 && (
                                <div className="text-xs font-semibold text-slate-400 italic">No items yet.</div>
                            )}
                        </div>
                    </section>

                    {/* Biggest Price Drop */}
                    <section className="mb-6">
                        <div className="px-4 flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-emerald-500 text-lg">trending_down</span>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Biggest Price Drop</h3>
                                <InfoTooltip text="Items with the largest percentage price drop compared to their 30-day average." />
                            </div>
                            <Link href="/markets" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
                                More <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </Link>
                        </div>
                        <div className="flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide">
                            {biggestDrops.map((item) => (
                                <Link href={`/price-index?itemId=${item.id}`} key={item.id} className="min-w-[148px] bg-white p-3.5 rounded-2xl border border-slate-100 shadow-soft flex flex-col hover:shadow-md transition-all group shrink-0">
                                    <div className="flex items-start justify-between mb-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">{item.icon}</div>
                                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-lg inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-50">
                                            <span className="material-symbols-outlined text-[12px]">trending_down</span>
                                            {item.trendPct.toFixed(1)}%
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-600 leading-tight mb-0.5 line-clamp-1">{item.name}</p>
                                    <p className="text-base font-extrabold text-slate-900 tabular-nums">{item.price}<span className="text-[10px] font-semibold text-slate-400 ml-0.5">{item.unit}</span></p>
                                </Link>
                            ))}
                            {biggestDrops.length === 0 && (
                                <div className="text-xs font-semibold text-slate-400 italic">No major drops yet.</div>
                            )}
                        </div>
                    </section>

                    {/* Recent Activity */}
                    <section className="px-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <ActivityCard key={activity.id} activity={activity} items={items} setFeed={setFeed} setActiveCommentReportId={setActiveCommentReportId} />
                            ))}
                        </div>
                    </section>
                </main>

                <AppBottomNav />
            </div>

            {/* Comment Drawer (shared by desktop and mobile) */}
            <CommentDrawer
                isOpen={!!activeCommentReportId}
                reportId={activeCommentReportId}
                onClose={() => setActiveCommentReportId(null)}
                onCommentSuccess={() => {
                    setFeed(prev => prev.map(item =>
                        item.id === activeCommentReportId
                            ? { ...item, commentCount: item.commentCount + 1 }
                            : item
                    ));
                }}
            />
        </div>
    );
};

// Extracted Activity Card component for reuse
interface ActivityCardProps {
    activity: FeedRow;
    items: Item[];
    setFeed: React.Dispatch<React.SetStateAction<FeedRow[]>>;
    setActiveCommentReportId: (id: number | null) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, items, setFeed, setActiveCommentReportId }) => {
    return (
        <Link href={`/reports/${activity.id}`} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-soft block hover:shadow-soft-lg transition-all group">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                    <span className="material-symbols-outlined text-slate-400">person</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-900 truncate pr-2">{activity.reporterName || 'Community Reporter'}</p>
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{timeAgo(activity.reportedAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 min-w-0 mt-0.5">
                        {activity.status === 'verified' && <span className="material-symbols-outlined text-[14px] text-emerald-500">verified</span>}
                        <span className="truncate">{activity.status === 'verified' ? 'Verified Report' : 'Community Submission'} • {activity.marketName}</span>
                    </p>
                </div>
            </div>

            <div className="flex items-stretch gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {getItemIcon(activity.itemName)}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <p className="text-base font-bold text-slate-800 leading-tight">{activity.itemName}</p>
                    <p className="text-2xl font-extrabold text-slate-900 tabular-nums tracking-tight mt-1">
                        {formatCurrency(activity.price)}
                        <span className="text-xs font-semibold text-slate-400 ml-1">/{items.find(i => i.id === activity.itemId)?.defaultUnit ?? 'unit'}</span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className={`flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50 ${activity.hasHelpfulVote ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const wasVoted = activity.hasHelpfulVote;
                        setFeed(prev => prev.map(r => r.id === activity.id ? {
                            ...r,
                            hasHelpfulVote: !wasVoted,
                            helpfulCount: wasVoted ? r.helpfulCount - 1 : r.helpfulCount + 1,
                        } : r));
                        try {
                            if (wasVoted) {
                                await apiDelete(`/api/v1/price-reports/${activity.id}/vote`);
                            } else {
                                await apiPost(`/api/v1/price-reports/${activity.id}/vote`, {});
                            }
                        } catch {
                            setFeed(prev => prev.map(r => r.id === activity.id ? {
                                ...r,
                                hasHelpfulVote: wasVoted,
                                helpfulCount: wasVoted ? r.helpfulCount + 1 : r.helpfulCount - 1,
                            } : r));
                        }
                    }}
                >
                    <span className={`material-symbols-outlined text-[18px] ${activity.hasHelpfulVote ? 'fill-1' : ''}`}>thumb_up</span>
                    <span className="text-xs font-bold">{activity.helpfulCount > 0 ? activity.helpfulCount : 'Helpful'}</span>
                </button>

                <button
                    type="button"
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveCommentReportId(activity.id);
                    }}
                >
                    <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                    <span className="text-xs font-bold">{activity.commentCount > 0 ? activity.commentCount : 'Comment'}</span>
                </button>
            </div>
        </Link>
    );
};
