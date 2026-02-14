"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { apiGet, formatCurrency, timeAgo } from '@/src/lib/api-client';
import { getPreferredRegionId } from '@/src/lib/region-preference';
import { SearchableSelect } from '@/src/components/ui/SearchableSelect';
import { PriceIndexScreenSkeleton } from '@/src/components/ui/Skeleton';

interface PriceIndexScreenProps {
    readonly className?: string;
}

type Item = {
    id: number;
    name: string;
    defaultUnit: string;
    currency: string;
};

type PriceIndexPayload = {
    item: Item;
    timeframe: '7d' | '30d' | '90d' | '1y';
    stats: {
        avgPrice: string;
        minPrice: string;
        maxPrice: string;
        reportCount: number;
        latestPrice: string | null;
        latestReportedAt: string | null;
    };
    series: {
        date: string;
        avgPrice: string;
    }[];
};

export const PriceIndexScreen: React.FC<PriceIndexScreenProps> = ({ className = '' }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [items, setItems] = useState<Item[]>([]);
    const [regions, setRegions] = useState<{ id: number; name: string }[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('7d');
    const [payload, setPayload] = useState<PriceIndexPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [regionId, setRegionId] = useState<number | null>(null);

    useEffect(() => {
        setRegionId(getPreferredRegionId());

        // Load regions
        const loadRegions = async () => {
            try {
                const data = await apiGet<{ id: number; name: string }[]>('/api/v1/regions');
                setRegions(data);
            } catch (err) {
                console.error('Failed to load regions', err);
            }
        };
        void loadRegions();
    }, []);

    const regionName = useMemo(() => {
        if (!regionId) return null;
        return regions.find(r => r.id === regionId)?.name ?? null;
    }, [regionId, regions]);

    useEffect(() => {
        let mounted = true;
        const loadItems = async () => {
            try {
                const rows = await apiGet<Item[]>('/api/v1/items?limit=100');
                if (!mounted) return;
                setItems(rows);

                const paramItemId = Number.parseInt(searchParams.get('itemId') ?? '', 10);
                const itemId = Number.isFinite(paramItemId) ? paramItemId : rows[0]?.id;
                if (itemId) {
                    setSelectedItemId(itemId);
                }
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load items');
            }
        };

        void loadItems();
        return () => {
            mounted = false;
        };
    }, [searchParams]);

    useEffect(() => {
        if (!selectedItemId) return;
        let mounted = true;

        const loadIndex = async () => {
            setLoading(true);
            setError(null);
            try {
                const preferredRegionId = getPreferredRegionId();
                const regionQuery = preferredRegionId ? `&regionId=${preferredRegionId}` : '';
                const result = await apiGet<PriceIndexPayload>(`/api/v1/price-index/${selectedItemId}?timeframe=${timeframe}${regionQuery}`);
                if (!mounted) return;
                setPayload(result);
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load price index');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void loadIndex();
        return () => {
            mounted = false;
        };
    }, [selectedItemId, timeframe]);

    const selectedItem = useMemo(() => {
        return items.find((item) => item.id === selectedItemId) ?? null;
    }, [items, selectedItemId]);

    const currency = selectedItem?.currency ?? payload?.item.currency ?? 'MYR';
    const latestPrice = payload?.stats.latestPrice ?? '0';
    const chart = useMemo(() => {
        let points = (payload?.series ?? []).map((entry) => ({
            date: entry.date,
            value: Number.parseFloat(entry.avgPrice),
        })).filter((entry) => Number.isFinite(entry.value));

        if (points.length === 0) {
            return null;
        }

        // If only one point, duplicate it to make a flat line
        if (points.length === 1) {
            points = [points[0], points[0]];
        }

        const width = 320;
        const height = 180;
        const padX = 38;
        const padY = 20;
        const statsMin = Number.parseFloat(payload?.stats.minPrice ?? '');
        const statsMax = Number.parseFloat(payload?.stats.maxPrice ?? '');
        const minValue = Number.isFinite(statsMin) ? statsMin : Math.min(...points.map((point) => point.value));
        const maxValue = Number.isFinite(statsMax) ? statsMax : Math.max(...points.map((point) => point.value));
        const valueRange = Math.max(maxValue - minValue, 1);
        const xStep = points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0;

        const line = points.map((point, index) => {
            const x = padX + index * xStep;
            const normalized = (point.value - minValue) / valueRange;
            const y = height - padY - normalized * (height - padY * 2);
            return { x, y };
        });

        const yTicks = [0, 0.5, 1].map((ratio) => {
            const y = height - padY - ratio * (height - padY * 2);
            const value = minValue + ratio * valueRange;
            return { y, value, label: formatCurrency(value) };
        });

        const pathCommands = line.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        return {
            width,
            height,
            minValue,
            maxValue,
            padX,
            firstDate: points[0]?.date ?? '',
            lastDate: points[points.length - 1]?.date ?? '',
            firstValue: points[0]?.value ?? 0,
            lastValue: points[points.length - 1]?.value ?? 0,
            path: pathCommands,
            lastPoint: line[line.length - 1],
            yTicks,
        };
    }, [payload?.series, payload?.stats.maxPrice, payload?.stats.minPrice]);

    return (
        <div className={`bg-slate-50 font-sans text-slate-900 antialiased min-h-screen pb-24 ${className}`}>
            <div className="max-w-md mx-auto min-h-screen flex flex-col pb-20 relative bottom-nav-safe">
                <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl px-4 py-3 border-b border-slate-200/50 flex items-center justify-between">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-soft hover:bg-slate-50 transition-colors text-slate-600" onClick={() => router.back()}>
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                    <div className="flex-1 px-4 text-center">
                        <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price Index</h1>
                        <h2 className="text-lg font-extrabold text-slate-900 leading-tight truncate">{selectedItem?.name ?? 'Loading...'}</h2>
                        {regionName && (
                            <div className="flex items-center justify-center gap-1 mt-1">
                                <span className="material-symbols-outlined text-[10px] text-emerald-600">location_on</span>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{regionName}</span>
                            </div>
                        )}
                    </div>
                    <div className="w-10" />
                </header>

                <section className="px-4 py-6 space-y-4">
                    <div className="relative">
                        <SearchableSelect
                            label="Item"
                            showLabel={false}
                            placeholder="Select item"
                            inputPlaceholder="Search item..."
                            value={selectedItemId}
                            onChange={(nextId) => {
                                setSelectedItemId(nextId);
                                const params = new URLSearchParams(searchParams.toString());
                                params.set('itemId', String(nextId));
                                router.replace(`/price-index?${params.toString()}`);
                            }}
                            options={items.map((item) => ({
                                value: item.id,
                                label: item.name,
                                hint: `/${item.defaultUnit}`,
                            }))}
                            buttonClassName="!border-slate-200 !rounded-xl !bg-white !shadow-soft !text-slate-700 !py-3"
                        />
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 w-full">
                        {(['7d', '30d', '90d', '1y'] as const).map((value) => (
                            <button
                                key={value}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${timeframe === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => setTimeframe(value)}
                            >
                                {value.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="px-4 pb-6">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-4xl font-extrabold tracking-tight text-slate-900">{formatCurrency(latestPrice, currency)}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                                    {timeframe.toUpperCase()} Avg
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                    {payload?.stats.latestReportedAt ? `Updated ${timeAgo(payload.stats.latestReportedAt)}` : 'No verified reports yet'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Report Count</p>
                            <div className="text-xl font-extrabold text-slate-900 bg-slate-100 rounded-lg px-2 py-0.5 inline-block min-w-[3rem] text-center">{payload?.stats.reportCount ?? 0}</div>
                        </div>
                    </div>
                </section>

                <section className="px-4 pb-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Price Trend</h3>
                            <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded-md">{timeframe.toUpperCase()}</span>
                        </div>

                        {chart ? (
                            <div className="relative z-10">
                                <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="w-full h-48 overflow-visible">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            {/* Dynamic gradient color based on trend */}
                                            {(() => {
                                                const firstVal = chart.firstValue;
                                                const lastVal = chart.lastValue;
                                                const isUp = lastVal > firstVal;
                                                const isDown = lastVal < firstVal;
                                                const stopColor = isUp ? "#e11d48" : isDown ? "#10b981" : "#64748b"; // rose-600, emerald-500, slate-500

                                                return (
                                                    <>
                                                        <stop offset="0%" stopColor={stopColor} stopOpacity="0.2" />
                                                        <stop offset="100%" stopColor={stopColor} stopOpacity="0" />
                                                    </>
                                                );
                                            })()}
                                        </linearGradient>
                                    </defs>

                                    {/* Grid Lines */}
                                    {chart.yTicks.map((tick, i) => (
                                        <g key={i}>
                                            <line x1={chart.padX} y1={tick.y} x2={chart.width - chart.padX} y2={tick.y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                            <text x={chart.padX - 8} y={tick.y + 3} textAnchor="end" className="text-[10px] fill-slate-300 font-medium">{tick.label}</text>
                                        </g>
                                    ))}

                                    {/* Area */}
                                    <path
                                        d={`${chart.path} L ${chart.width - chart.padX} ${chart.height - 20} L ${chart.padX} ${chart.height - 20} Z`}
                                        fill="url(#chartGradient)"
                                    />

                                    {/* Line */}
                                    <path
                                        d={chart.path}
                                        fill="none"
                                        stroke={(() => {
                                            const firstVal = chart.firstValue;
                                            const lastVal = chart.lastValue;
                                            return lastVal > firstVal ? "#e11d48" : lastVal < firstVal ? "#10b981" : "#64748b";
                                        })()}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    {chart.lastPoint ? (
                                        <g>
                                            <circle cx={chart.lastPoint.x} cy={chart.lastPoint.y} r="6" fill={(() => {
                                                const firstVal = chart.firstValue;
                                                const lastVal = chart.lastValue;
                                                return lastVal > firstVal ? "#e11d48" : lastVal < firstVal ? "#10b981" : "#64748b";
                                            })()} fillOpacity="0.2" />
                                            <circle cx={chart.lastPoint.x} cy={chart.lastPoint.y} r="3.5" fill={(() => {
                                                const firstVal = chart.firstValue;
                                                const lastVal = chart.lastValue;
                                                return lastVal > firstVal ? "#e11d48" : lastVal < firstVal ? "#10b981" : "#64748b";
                                            })()} stroke="white" strokeWidth="1.5" />
                                        </g>
                                    ) : null}
                                </svg>
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
                                    <span>{chart.firstDate}</span>
                                    <span>{chart.lastDate}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center relative z-10">
                                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">show_chart</span>
                                <p className="text-sm font-medium text-slate-400">No historical data available yet.</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="px-4 pb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Market Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                    <span className="material-symbols-outlined text-lg">functions</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average</p>
                            </div>
                            <p className="text-xl font-extrabold text-slate-900">{formatCurrency(payload?.stats.avgPrice ?? 0, currency)}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">{timeframe.toUpperCase()}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                                    <span className="material-symbols-outlined text-lg">payments</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest</p>
                            </div>
                            <p className="text-xl font-extrabold text-emerald-600">{formatCurrency(latestPrice, currency)}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">per {selectedItem?.defaultUnit ?? 'unit'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500">
                                    <span className="material-symbols-outlined text-lg">arrow_downward</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lowest</p>
                            </div>
                            <p className="text-xl font-extrabold text-slate-900">{formatCurrency(payload?.stats.minPrice ?? 0, currency)}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">{timeframe.toUpperCase()}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500">
                                    <span className="material-symbols-outlined text-lg">arrow_upward</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Highest</p>
                            </div>
                            <p className="text-xl font-extrabold text-slate-900">{formatCurrency(payload?.stats.maxPrice ?? 0, currency)}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">{timeframe.toUpperCase()}</p>
                        </div>
                    </div>
                </section>

                <section className="px-4 mb-6">
                    <Link href={`/search?query=${encodeURIComponent(selectedItem?.name ?? '')}`} className="w-full bg-slate-900 text-white py-4 rounded-2xl shadow-lg shadow-slate-900/20 flex items-center justify-between px-6 hover:bg-slate-800 transition-all active:scale-[0.98] group">
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider mb-0.5 group-hover:text-primary-300">Where to buy</span>
                            <span className="text-lg font-bold">Compare Prices</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary-400 group-hover:translate-x-1 transition-transform group-hover:text-primary-300">arrow_forward</span>
                        </div>
                    </Link>
                </section>

                {loading && <PriceIndexScreenSkeleton />}
                {error && <div className="mx-4 my-6 p-4 text-sm text-rose-500 bg-rose-50 rounded-xl border border-rose-100 text-center">{error}</div>}
            </div>
        </div>
    );
};
