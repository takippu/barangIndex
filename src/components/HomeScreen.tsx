"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { apiGet, apiPost, apiDelete, formatCurrency, timeAgo } from '@/src/lib/api-client';
import { getItemIcon } from '@/src/lib/item-icons';
import { SearchableSelect } from '@/src/components/ui/SearchableSelect';
import { getPreferredRegionId, setPreferredRegionId } from '@/src/lib/region-preference';
import { AppBottomNav } from '@/src/components/AppBottomNav';
import { HomeScreenSkeleton } from '@/src/components/ui/Skeleton';
import { DesktopHeader } from '@/src/components/DesktopHeader';

interface HomeScreenProps {
    readonly className?: string;
    readonly feed?: FeedRow[];
    readonly items?: Item[];
    readonly regions?: RegionOption[];
    readonly pulse?: PulsePayload | null;
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

import { CommentDrawer } from '@/src/components/ui/CommentDrawer';

export const HomeScreen: React.FC<HomeScreenProps> = ({ feed: initialFeed = [], items: initialItems = [], regions: initialRegions = [], pulse: initialPulse = null }) => {
    const router = useRouter();
    const [feed, setFeed] = useState<FeedRow[]>(initialFeed);
    const [items, setItems] = useState<Item[]>(initialItems);
    const [regions, setRegions] = useState<RegionOption[]>(initialRegions);
    const [selectedRegionId, setSelectedRegionId] = useState<number | null>(() => getPreferredRegionId());
    const [pulse, setPulse] = useState<PulsePayload | null>(initialPulse);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCommentReportId, setActiveCommentReportId] = useState<number | null>(null);

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
                const preferredRegionId = getPreferredRegionId();
                if (preferredRegionId && uniqueRegions.some((region) => region.id === preferredRegionId)) {
                    setSelectedRegionId(preferredRegionId);
                    return;
                }
                const klangValley = uniqueRegions.find((region) => region.name.toLowerCase().includes('klang'));
                setSelectedRegionId(klangValley?.id ?? uniqueRegions[0]?.id ?? null);
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

    const topMovers = useMemo(() => {
        return items.slice(0, 3).map((item) => {
            const itemReports = feed
                .filter((entry) => entry.itemId === item.id)
                .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
            const latestReport = itemReports[0];
            const previousReport = itemReports[1];
            const price = latestReport ? formatCurrency(latestReport.price, item.currency) : formatCurrency(0, item.currency);
            const latestPrice = latestReport ? Number.parseFloat(latestReport.price) : 0;
            const previousPrice = previousReport ? Number.parseFloat(previousReport.price) : 0;
            const trendPct = previousPrice > 0 ? ((latestPrice - previousPrice) / previousPrice) * 100 : 0;
            const trend = trendPct > 0 ? 'up' : trendPct < 0 ? 'down' : 'neutral';

            return {
                id: item.id,
                name: item.name,
                price,
                unit: `/${item.defaultUnit}`,
                icon: getItemIcon(item.name, item.category),
                trendPct,
                trend,
            };
        });
    }, [feed, items]);

    const recentActivity = useMemo(() => {
        return feed.slice(0, 5);
    }, [feed]);

    return (
        <div className="min-h-screen bg-slate-50 pb-24 lg:pb-0 font-sans text-slate-900 selection:bg-primary-100 selection:text-primary-900">
            {/* Desktop Header - Only visible on large screens */}
            <DesktopHeader activeNav="/home" />

            <div className="max-w-md mx-auto min-h-screen bg-white lg:max-w-7xl lg:bg-transparent lg:shadow-none lg:border-0 lg:rounded-none lg:p-6 overflow-hidden relative">
                <header className="lg:hidden sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl px-4 pt-6 pb-2 border-b border-slate-200/50">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Grocery<span className="text-primary-600">Index</span></h1>
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
                            placeholder="Search items (e.g., Tomato, Eggs)..."
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

                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
                    {/* Left Sidebar */}
                    <div className="col-span-3 space-y-6">
                        {/* Region Selector */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <label className="text-sm font-semibold text-slate-700 mb-3 block">Select Region</label>
                            <SearchableSelect
                                options={regions.map(r => ({ value: r.id, label: r.name }))}
                                placeholder="Choose area..."
                                value={selectedRegionId}
                                onChange={(val) => setSelectedRegionId(val)}
                                label="Region"
                                showLabel={false}
                            />
                        </div>

                        {/* Quick Stats */}
                        {pulse && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h3 className="text-sm font-semibold text-slate-700 mb-4">30-Day Activity</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 text-sm">Total Reports</span>
                                        <span className="font-bold text-slate-900">{pulse.totals.totalReports.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 text-sm">Verified</span>
                                        <span className="font-bold text-emerald-600">{pulse.totals.verifiedReports.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 text-sm">Contributors</span>
                                        <span className="font-bold text-sky-600">{pulse.totals.activeContributors.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="col-span-6 space-y-6">
                        {/* Search Bar */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 placeholder-slate-400 outline-none transition-all"
                                    placeholder="Search items (e.g., Tomato, Eggs)..."
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
                        </div>

                        {/* Community Pulse Chart */}
                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">Community Pulse</h3>
                                    <p className="text-2xl font-extrabold">{pulse?.totals.totalReports.toLocaleString() ?? 0} Reports</p>
                                </div>
                                <div className="flex gap-2">
                                    {pulse && (
                                        <>
                                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">{pulse.totals.verifiedReports} Verified</span>
                                            <span className="px-3 py-1 bg-sky-500/20 text-sky-400 text-xs font-bold rounded-full">{pulse.totals.activeMarkets} Markets</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {/* Chart */}
                            <div className="h-40 flex items-end gap-2">
                                {pulse?.series && pulse.series.length > 0 ? (
                                    pulse.series.map((s, i) => {
                                        const maxReports = Math.max(...pulse.series.map(x => x.reports), 1);
                                        const heightPct = Math.max(5, (s.reports / maxReports) * 100);
                                        return (
                                            <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1 group relative">
                                                <div
                                                    className="w-full bg-gradient-to-t from-sky-500 to-cyan-400 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity"
                                                    style={{ height: `${heightPct}%` }}
                                                />
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                                                    {s.reports} reports on {new Date(s.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                        {loading ? 'Loading data...' : 'No activity data available'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <ActivityCard key={activity.id} activity={activity} items={items} setFeed={setFeed} setActiveCommentReportId={setActiveCommentReportId} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="col-span-3 space-y-6">
                        {/* Top Movers */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Movers</h3>
                            <div className="space-y-3">
                                {topMovers.map((mover) => (
                                    <Link href={`/price-index?itemId=${mover.id}`} key={mover.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{mover.icon}</span>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{mover.name}</p>
                                                <p className="text-xs text-slate-500">{mover.price}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${mover.trend === 'up' ? 'text-rose-600 bg-rose-50' :
                                            mover.trend === 'down' ? 'text-emerald-600 bg-emerald-50' :
                                                'text-slate-600 bg-slate-100'
                                            }`}>
                                            {mover.trend === 'neutral' ? '~' : `${mover.trend === 'up' ? '+' : ''}${mover.trendPct.toFixed(1)}%`}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Submit CTA */}
                        <div className="bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg shadow-sky-500/25">
                            <h3 className="font-bold text-lg mb-2">Contribute Data</h3>
                            <p className="text-sky-100 text-sm mb-4">Help the community by submitting prices from your local market.</p>
                            <a href="/submit" className="flex items-center justify-center gap-2 w-full py-3 bg-white text-sky-600 font-semibold rounded-xl hover:bg-sky-50 transition-colors">
                                <span className="material-symbols-outlined">add</span>
                                Submit Price
                            </a>
                        </div>
                    </div>
                </div>

                {/* Mobile Layout */}
                <main className="lg:hidden space-y-6 pt-6">
                    {/* Community Pulse */}
                    <section className="px-4">
                        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-soft relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

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
                                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                                                    </linearGradient>
                                                </defs>
                                                <path d={areaPath} fill="url(#pulseGrad)" />
                                                <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                                                <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
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
                                            <p className="text-lg font-extrabold text-sky-400 tabular-nums">{pulse.totals.activeContributors}</p>
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Contributors</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Top Movers */}
                    <section className="mb-6">
                        <div className="px-4 flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Top Movers (24h)</h3>
                        </div>
                        <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide -mx-4">
                            <div className="w-4 shrink-0" />
                            {topMovers.map((mover) => (
                                <Link href={`/price-index?itemId=${mover.id}`} key={mover.id} className="min-w-[172px] bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{mover.icon}</div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg inline-flex items-center gap-1 ${mover.trend === 'up' ? 'text-rose-600 bg-rose-50' :
                                            mover.trend === 'down' ? 'text-emerald-600 bg-emerald-50' :
                                                'text-slate-500 bg-slate-100'
                                            }`}>
                                            <span className="material-symbols-outlined text-[14px]">
                                                {mover.trend === 'up' ? 'trending_up' : mover.trend === 'down' ? 'trending_down' : 'remove'}
                                            </span>
                                            {mover.trend === 'neutral' ? '~' : `${mover.trend === 'up' ? '+' : ''}${mover.trendPct.toFixed(1)}%`}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-600 leading-tight mb-1 line-clamp-1">{mover.name}</p>
                                        <p className="text-lg font-extrabold text-slate-900 tabular-nums">{mover.price}<span className="text-xs font-semibold text-slate-400 ml-0.5">{mover.unit}</span></p>
                                    </div>
                                </Link>
                            ))}
                            {!loading && topMovers.length === 0 && (
                                <div className="text-xs font-semibold text-slate-500 px-4">No significant price movements yet.</div>
                            )}
                            <div className="w-4 shrink-0" />
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
                        {activity.status === 'verified' && <span className="material-symbols-outlined text-[14px] text-primary-500">verified</span>}
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
