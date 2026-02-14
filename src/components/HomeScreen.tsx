"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { apiGet, formatCurrency, timeAgo } from '@/src/lib/api-client';
import { getItemIcon } from '@/src/lib/item-icons';
import { SearchableSelect } from '@/src/components/ui/SearchableSelect';

interface HomeScreenProps {
    readonly className?: string;
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

export const HomeScreen: React.FC<HomeScreenProps> = ({ className = '' }) => {
    const [items, setItems] = useState<Item[]>([]);
    const [feed, setFeed] = useState<FeedRow[]>([]);
    const [regions, setRegions] = useState<RegionOption[]>([]);
    const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
    const [pulse, setPulse] = useState<PulsePayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadInitial = async () => {
            try {
                const [itemRows, marketRows] = await Promise.all([
                    apiGet<Item[]>('/api/v1/items?limit=12'),
                    apiGet<Array<{ regionId: number; regionName: string }>>('/api/v1/markets'),
                ]);

                if (!mounted) return;
                setItems(itemRows);
                const uniqueRegions = Array.from(
                    new Map(marketRows.map((row) => [row.regionId, { id: row.regionId, name: row.regionName }])).values(),
                );
                setRegions(uniqueRegions);
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
            const latestReport = feed.find((entry) => entry.itemId === item.id);
            const price = latestReport ? formatCurrency(latestReport.price, item.currency) : formatCurrency(0, item.currency);
            return {
                id: item.id,
                name: item.name,
                price,
                unit: `/${item.defaultUnit}`,
                icon: getItemIcon(item.name, item.category),
            };
        });
    }, [feed, items]);

    const recentActivity = useMemo(() => {
        return feed.slice(0, 5);
    }, [feed]);

    const pulseChart = useMemo(() => {
        const points = (pulse?.series ?? []).map((entry) => ({
            date: entry.date,
            value: entry.reports,
        }));
        if (!points.length) {
            return null;
        }

        const width = 100;
        const height = 40;
        const max = Math.max(...points.map((point) => point.value), 1);
        const path = points.map((point, index) => {
            const x = points.length > 1 ? (index / (points.length - 1)) * width : 0;
            const y = height - (point.value / max) * (height - 5);
            return `${x},${y}`;
        }).join(' ');

        return { path };
    }, [pulse?.series]);

    return (
        <div className={`bg-[#f6f8f7]  font-display text-[#1a2e21]  antialiased min-h-screen pb-24 ${className}`}>
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative">

                {/* Header */}
                <header className="sticky top-0 z-20 bg-[#f6f8f7]/90  backdrop-blur-md px-4 pt-6 pb-2 border-b border-[#17cf5a]/5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Location</h1>
                            <SearchableSelect
                                label="Location"
                                showLabel={false}
                                placeholder="Select location"
                                inputPlaceholder="Search area..."
                                value={selectedRegionId ?? 0}
                                onChange={(nextValue) => setSelectedRegionId(nextValue === 0 ? null : nextValue)}
                                options={[
                                    { value: 0, label: "All Areas" },
                                    ...regions.map((region) => ({
                                        value: region.id,
                                        label: region.name,
                                    })),
                                ]}
                                buttonClassName="!bg-transparent !border-0 !p-0 text-lg font-extrabold text-[#17cf5a] min-h-0 w-auto gap-1"
                                dropdownClassName="w-64"
                                containerClassName="mt-1 w-fit"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-3 bg-white  border border-[#17cf5a]/10 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#17cf5a]/50 focus:border-[#17cf5a] placeholder-gray-400 outline-none shadow-sm transition-all"
                            placeholder="Search items (e.g., Tomato, Eggs)..."
                            type="text"
                        />
                    </div>
                </header>

                {/* Market Pulse */}
                <section className="px-4 py-4">
                    <div className="bg-white  rounded-2xl p-5 border border-[#17cf5a]/10 shadow-sm relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-[#17cf5a]/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Market Pulse</h2>
                                <p className="text-2xl font-extrabold mt-1">{pulse?.region.name ?? 'Community Feed'}</p>
                                <p className="text-xs font-semibold text-gray-500 mt-0.5">30-day community trend</p>
                            </div>
                            <span className="px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-0.5 text-[#17cf5a] bg-[#17cf5a]/10">
                                <span className="material-symbols-outlined text-sm">insights</span>
                                {pulse?.totals.totalReports ?? 0} reports
                            </span>
                        </div>
                        {/* Simple SVG Chart */}
                        <div className="h-16 w-full relative mb-4">
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                                <defs>
                                    <linearGradient id="snapshotGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#17cf5a" stopOpacity="0.2"></stop>
                                        <stop offset="100%" stopColor="#17cf5a" stopOpacity="0"></stop>
                                    </linearGradient>
                                </defs>
                                {pulseChart ? (
                                    <>
                                        <polygon points={`0,40 ${pulseChart.path} 100,40`} fill="url(#snapshotGradient)"></polygon>
                                        <polyline points={pulseChart.path} fill="none" stroke="#17cf5a" strokeLinecap="round" strokeWidth="2"></polyline>
                                    </>
                                ) : (
                                    <path d="M0,35 Q10,32 20,25 T40,28 T60,15 T80,18 T100,5" fill="none" stroke="#17cf5a" strokeLinecap="round" strokeWidth="2"></path>
                                )}
                            </svg>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3 relative z-10">
                            <div className="bg-[#f6f8f7] rounded-lg p-2">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Verified</p>
                                <p className="text-sm font-extrabold">{pulse?.totals.verifiedReports ?? 0}</p>
                            </div>
                            <div className="bg-[#f6f8f7] rounded-lg p-2">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Pending</p>
                                <p className="text-sm font-extrabold">{pulse?.totals.pendingReports ?? 0}</p>
                            </div>
                            <div className="bg-[#f6f8f7] rounded-lg p-2">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Contributors</p>
                                <p className="text-sm font-extrabold">{pulse?.totals.activeContributors ?? 0}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium text-gray-500 relative z-10">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-[#17cf5a] rounded-full"></span>
                                {loading ? 'Refreshing...' : `${pulse?.totals.activeMarkets ?? 0} active markets`}
                            </span>
                            <span>{pulse?.totals.lastReportedAt ? `Updated ${timeAgo(pulse.totals.lastReportedAt)}` : 'No data yet'}</span>
                        </div>
                    </div>
                </section>

                {/* Top Movers */}
                <section className="mb-6">
                    <div className="px-4 flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Top Movers (24h)</h3>
                    </div>
                    <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
                        {topMovers.map((mover) => (
                            <Link href={`/price-index?itemId=${mover.id}`} key={mover.id} className="min-w-[140px] bg-white  p-3 rounded-xl border border-[#17cf5a]/5 flex flex-col justify-between">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50  flex items-center justify-center text-xl">{mover.icon}</div>
                                    <span className="text-xs font-bold px-1.5 py-0.5 rounded text-[#17cf5a] bg-[#17cf5a]/10">Live</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500">{mover.name}</p>
                                    <p className="text-sm font-extrabold">{mover.price}<span className="text-[10px] font-normal text-gray-400">{mover.unit}</span></p>
                                </div>
                            </Link>
                        ))}
                        {!loading && topMovers.length === 0 && (
                            <div className="text-xs font-semibold text-gray-500">No items available yet.</div>
                        )}
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="px-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <Link href={`/reports/${activity.id}`} key={activity.id} className="bg-white  rounded-xl p-4 border border-[#17cf5a]/5 block">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100  flex items-center justify-center overflow-hidden">
                                        <span className="material-symbols-outlined text-gray-400">person</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-bold">Community Reporter</p>
                                            <span className="text-[10px] font-medium text-gray-400">{timeAgo(activity.reportedAt)}</span>
                                        </div>
                                        <p className="text-xs text-[#17cf5a] font-semibold flex items-center gap-1">
                                            {activity.status === 'verified' && <span className="material-symbols-outlined text-xs">verified</span>}
                                            {activity.status === 'verified' ? 'Verified Report' : 'Community Report'} • {activity.marketName}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-[#f6f8f7]  rounded-lg p-3 mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white  flex items-center justify-center text-xl shadow-sm">{getItemIcon(activity.itemName)}</div>
                                        <div>
                                            <p className="text-sm font-bold">{activity.itemName}</p>
                                            <p className="text-xs text-gray-500">{activity.marketName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold">{formatCurrency(activity.price)}<span className="text-xs font-normal">/unit</span></p>
                                        <span className="text-[10px] font-bold text-[#17cf5a]">Reported {timeAgo(activity.reportedAt)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-2 px-1">
                                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#17cf5a] transition-colors">
                                        <span className="material-symbols-outlined text-lg">thumb_up</span>
                                        <span className="text-xs font-bold">0</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#17cf5a] transition-colors">
                                        <span className="material-symbols-outlined text-lg">comment</span>
                                        <span className="text-xs font-bold">0</span>
                                    </button>
                                </div>
                            </Link>
                        ))}
                        {!loading && recentActivity.length === 0 && (
                            <div className="text-sm text-gray-500">No reports yet. Be the first to submit one.</div>
                        )}
                        {error && (
                            <div className="text-sm text-red-500">{error}</div>
                        )}
                    </div>
                </section>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95  backdrop-blur-xl border-t border-[#17cf5a]/10 px-6 py-3 flex justify-between items-center z-30">
                    {[
                        { label: 'Home', icon: 'home', href: '/home', isActive: true },
                        { label: 'Items', icon: 'inventory_2', href: '/markets' },
                        { label: 'Add', icon: 'add', isFab: true, href: '/submit' },
                        { label: 'Alerts', icon: 'notifications', href: '#' },
                        { label: 'Profile', icon: 'person', href: '/profile' },
                    ].map((item, index) => (
                        item.isFab ? (
                            <div key={index} className="relative -top-6">
                                <Link href={item.href} className="w-14 h-14 bg-[#17cf5a] text-white rounded-full shadow-lg shadow-[#17cf5a]/40 flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
                                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                                </Link>
                            </div>
                        ) : (
                            <Link key={index} className={`flex flex-col items-center gap-1 ${item.isActive ? 'text-[#17cf5a]' : 'text-gray-400 hover:text-[#17cf5a]'} transition-colors`} href={item.href}>
                                <span className={`material-symbols-outlined ${item.isActive ? 'fill-1' : ''}`}>{item.icon}</span>
                                <span className="text-[10px] font-bold">{item.label}</span>
                            </Link>
                        )
                    ))}
                </nav>
            </div>
        </div>
    );
};
