import React from 'react';
import { formatCurrency } from '@/src/lib/api-client';

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

interface MarketsStatsCardProps {
    readonly items: Market[];
    readonly itemTrends: Record<number, ItemTrendSnapshot>;
    readonly pulse?: {
        totals: {
            totalReports: number;
            totalItems: number;
        };
    };
}

export const MarketsStatsCard: React.FC<MarketsStatsCardProps> = ({ items, itemTrends, pulse }) => {
    // Calculate stats
    const totalItems = items.length;
    let totalReports = 0;
    let upCount = 0;
    let downCount = 0;
    let maxChangeItem = { name: '', change: 0, isUp: false };

    items.forEach((item) => {
        const trend = itemTrends[item.id];
        if (!trend) return;

        totalReports += trend.reportCount;
        const latest = Number.parseFloat(trend.latestPrice ?? '0');
        const avg = Number.parseFloat(trend.avgPrice ?? '0');

        if (latest > 0 && avg > 0) {
            const trendPct = ((latest - avg) / avg) * 100;
            if (trendPct > 0) upCount++;
            if (trendPct < 0) downCount++;

            if (Math.abs(trendPct) > maxChangeItem.change) {
                maxChangeItem = {
                    name: item.name,
                    change: Math.abs(trendPct),
                    isUp: trendPct > 0
                };
            }
        }
    });

    // Use global stats if available, otherwise fallback to loaded stats
    const displayTotalItems = pulse?.totals.totalItems ?? totalItems;
    const displayTotalReports = pulse?.totals.totalReports ?? totalReports;

    const sentiment = totalItems > 0
        ? upCount > downCount ? 'Inflationary' : downCount > upCount ? 'Deflationary' : 'Neutral'
        : 'Neutral';
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-8 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Market Sentiment</div>
                <div className={`text-xl font-extrabold ${sentiment === 'Deflationary' ? 'text-emerald-600' : sentiment === 'Inflationary' ? 'text-rose-600' : 'text-slate-600'}`}>
                    {sentiment}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">
                    {upCount} up, {downCount} down
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Items</div>
                <div className="text-xl font-extrabold text-slate-900">
                    {displayTotalItems}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">
                    Tracked actively
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Reports (All Time)</div>
                <div className="text-xl font-extrabold text-sky-600">
                    {displayTotalReports}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">
                    Community contributions
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Top Mover</div>
                <div className="truncate text-xl font-extrabold text-slate-900 w-full" title={maxChangeItem.name || '-'}>
                    {maxChangeItem.name || '-'}
                </div>
                <div className={`text-xs font-bold mt-1 inline-flex items-center gap-1 ${maxChangeItem.isUp ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {maxChangeItem.change > 0 && (
                        <>
                            <span className="material-symbols-outlined text-[14px]">
                                {maxChangeItem.isUp ? 'trending_up' : 'trending_down'}
                            </span>
                            {maxChangeItem.change.toFixed(1)}%
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
