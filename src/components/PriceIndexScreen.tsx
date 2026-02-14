"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { apiGet, formatCurrency, timeAgo } from '@/src/lib/api-client';
import { getPreferredRegionId } from '@/src/lib/region-preference';

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
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [payload, setPayload] = useState<PriceIndexPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        const points = (payload?.series ?? []).map((entry) => ({
            date: entry.date,
            value: Number.parseFloat(entry.avgPrice),
        })).filter((entry) => Number.isFinite(entry.value));

        if (points.length === 0) {
            return null;
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
            return { y, value };
        });

        return {
            width,
            height,
            minValue,
            maxValue,
            padX,
            firstDate: points[0]?.date ?? '',
            lastDate: points[points.length - 1]?.date ?? '',
            path: line.map((point) => `${point.x},${point.y}`).join(' '),
            lastPoint: line[line.length - 1],
            yTicks,
        };
    }, [payload?.series, payload?.stats.maxPrice, payload?.stats.minPrice]);

    return (
        <div className={`bg-[#f6f8f7] text-[#1a2e21] min-h-screen pb-24 ${className}`}>
            <div className="max-w-md mx-auto min-h-screen flex flex-col pb-20">
                <header className="sticky top-0 z-20 bg-[#f6f8f7]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-[#17cf5a]/10">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors" onClick={() => router.back()}>
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <div className="flex-1 px-3">
                        <h1 className="text-sm font-semibold text-[#17cf5a] uppercase tracking-wider">Price Index</h1>
                        <h2 className="text-lg font-extrabold leading-tight truncate">{selectedItem?.name ?? 'Loading...'}</h2>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors">
                        <span className="material-symbols-outlined text-2xl">share</span>
                    </button>
                </header>

                <section className="px-4 py-4 space-y-3">
                    <div className="relative">
                        <select
                            className="w-full pl-3 pr-3 py-2 bg-white border border-[#17cf5a]/20 rounded-lg text-sm font-semibold"
                            value={selectedItemId ?? ''}
                            onChange={(event) => {
                                const nextId = Number.parseInt(event.target.value, 10);
                                if (Number.isFinite(nextId)) {
                                    setSelectedItemId(nextId);
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set('itemId', String(nextId));
                                    router.replace(`/price-index?${params.toString()}`);
                                }
                            }}
                        >
                            {items.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex bg-[#17cf5a]/5 p-1 rounded-lg shrink-0 w-fit">
                        {(['7d', '30d', '90d', '1y'] as const).map((value) => (
                            <button
                                key={value}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md ${timeframe === value ? 'bg-white text-[#17cf5a] shadow-sm' : 'hover:bg-white'}`}
                                onClick={() => setTimeframe(value)}
                            >
                                {value.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="px-4 pt-2 pb-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-3xl font-extrabold tracking-tight">{formatCurrency(latestPrice, currency)}</div>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="bg-[#17cf5a]/10 px-2 py-0.5 rounded-full text-xs font-bold text-[#17cf5a]">
                                    {timeframe.toUpperCase()} window
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                    {payload?.stats.latestReportedAt ? `Updated ${timeAgo(payload.stats.latestReportedAt)}` : 'No verified reports yet'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter">Report Count</p>
                            <p className="text-sm font-bold">{payload?.stats.reportCount ?? 0}</p>
                        </div>
                    </div>
                </section>

                <section className="px-4 pt-1 pb-5">
                    <div className="bg-white rounded-xl border border-[#17cf5a]/10 p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Trend</h3>
                            <span className="text-[11px] text-gray-400">{timeframe.toUpperCase()}</span>
                        </div>
                        {chart ? (
                            <div>
                                <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="w-full h-44">
                                    {chart.yTicks.map((tick) => (
                                        <g key={tick.y}>
                                            <line x1={chart.padX} y1={tick.y} x2={chart.width} y2={tick.y} stroke="#e5e7eb" strokeWidth="1" />
                                            <text x={2} y={tick.y + 3} fontSize="9" fill="#9ca3af">
                                                {Number.isFinite(tick.value) ? tick.value.toFixed(2) : "0.00"}
                                            </text>
                                        </g>
                                    ))}
                                    <polyline
                                        fill="none"
                                        stroke="#17cf5a"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        points={chart.path}
                                    />
                                    {chart.lastPoint ? (
                                        <circle cx={chart.lastPoint.x} cy={chart.lastPoint.y} r="4" fill="#17cf5a" />
                                    ) : null}
                                </svg>
                                <div className="flex items-center justify-between text-[10px] text-gray-400 -mt-1 px-1">
                                    <span>{chart.firstDate}</span>
                                    <span>
                                        {formatCurrency(chart.minValue.toFixed(2), currency)} - {formatCurrency(chart.maxValue.toFixed(2), currency)}
                                    </span>
                                    <span>{chart.lastDate}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 py-8 text-center">No historical points yet.</p>
                        )}
                    </div>
                </section>

                <section className="px-4 py-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 px-1">Market Statistics</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Average</p>
                            <p className="text-base font-extrabold">{formatCurrency(payload?.stats.avgPrice ?? 0, currency)}</p>
                            <p className="text-[10px] font-medium text-gray-400">{timeframe.toUpperCase()}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Latest</p>
                            <p className="text-base font-extrabold text-[#17cf5a]">{formatCurrency(latestPrice, currency)}</p>
                            <p className="text-[10px] font-medium text-gray-400">{selectedItem?.defaultUnit ?? 'unit'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Min</p>
                            <p className="text-base font-extrabold">{formatCurrency(payload?.stats.minPrice ?? 0, currency)}</p>
                            <p className="text-[10px] font-medium text-gray-400">{timeframe.toUpperCase()}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Max</p>
                            <p className="text-base font-extrabold">{formatCurrency(payload?.stats.maxPrice ?? 0, currency)}</p>
                            <p className="text-[10px] font-medium text-gray-400">{timeframe.toUpperCase()}</p>
                        </div>
                    </div>
                </section>

                <section className="px-4 mb-6">
                    <Link href={`/search?query=${encodeURIComponent(selectedItem?.name ?? '')}`} className="w-full bg-[#1a2e21] text-white py-4 rounded-xl shadow-lg shadow-[#1a2e21]/20 flex items-center justify-between px-6 hover:bg-gray-800 transition-colors group">
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-[#17cf5a] uppercase tracking-wider mb-0.5">Where to buy</span>
                            <span className="text-lg font-bold">Compare Prices</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#17cf5a] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </Link>
                </section>

                {loading && <p className="px-4 text-sm text-gray-500">Loading price index...</p>}
                {error && <p className="px-4 text-sm text-red-500">{error}</p>}
            </div>
        </div>
    );
};
