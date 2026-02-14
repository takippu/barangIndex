"use client";

import React from "react";
import Link from "next/link";
import { InfoTooltip } from "@/src/components/ui/InfoTooltip";

interface HighlightProps {
    pulse: any;
    topMovers?: any[];
    mostContributed?: any[];
    biggestDrops?: any[];
}

export const HighlightsSection: React.FC<HighlightProps> = ({ pulse, topMovers = [], mostContributed = [], biggestDrops = [] }) => {
    // Mock data for the sparkline chart
    // Mock data removed, using pulse.series for chart


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Card 1: Community Pulse (Left Column - Matches Mobile Style) */}
            <div className="bg-slate-900 rounded-2xl p-5 shadow-sm flex flex-col h-56 relative overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Community Pulse</h3>
                            <p className="text-lg font-extrabold text-white leading-tight">
                                {pulse ? `${pulse.totals.totalReports.toLocaleString()} Reports` : 'Loading...'}
                                <span className="text-xs font-semibold text-slate-400 ml-1.5">30d</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                            <span className="material-symbols-outlined text-emerald-400">monitoring</span>
                        </div>
                    </div>

                    {/* SVG Area Chart */}
                    {(() => {
                        const series = pulse?.series ?? [];
                        if (series.length === 0) {
                            return (
                                <div className="flex items-center justify-center flex-1 text-xs text-slate-500">
                                    No data available
                                </div>
                            );
                        }

                        const values: number[] = series.map((s: any) => s.reports);
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
                                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-16 mt-1" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="highlightPulseGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
                                        </linearGradient>
                                    </defs>
                                    <path d={areaPath} fill="url(#highlightPulseGrad)" />
                                    <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                                    <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="#10B981" stroke="#0f172a" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                                </svg>
                                <div className="flex justify-between mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span>{formatLabel(series[0].date)}</span>
                                    <span>{formatLabel(series[Math.floor(series.length / 2)].date)}</span>
                                    <span>{formatLabel(series[series.length - 1].date)}</span>
                                </div>
                            </>
                        );
                    })()}

                    {/* Stats Row */}
                    {pulse && (
                        <div className="flex gap-3 mt-auto pt-2 border-t border-white/10">
                            <div className="flex-1 text-center">
                                <p className="text-sm font-extrabold text-emerald-400 tabular-nums">{pulse.totals.verifiedReports}</p>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Verified</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-sm font-extrabold text-amber-400 tabular-nums">{pulse.totals.pendingReports}</p>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-sm font-extrabold text-emerald-400 tabular-nums">{pulse.totals.activeContributors}</p>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Contributors</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Card 2: Most Contributed (Middle Column) */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-56 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-xl">local_fire_department</span>
                        <h3 className="font-bold text-slate-900">Most Contributed</h3>
                        <InfoTooltip text="Items with the most price reports from the community in the last 30 days." />
                    </div>
                    <Link href="/markets" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
                        More <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </Link>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-3">
                    {mostContributed.length > 0 ? (
                        mostContributed.slice(0, 3).map((item: any, idx: number) => (
                            <Link href={`/price-index?itemId=${item.id}`} key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-5 shrink-0 flex justify-center">
                                        {idx === 0 ? (
                                            <span className="material-symbols-outlined text-amber-400 text-lg" title="#1 Most Contributed">emoji_events</span>
                                        ) : idx === 1 ? (
                                            <span className="material-symbols-outlined text-slate-400 text-lg" title="#2 Most Contributed">emoji_events</span>
                                        ) : idx === 2 ? (
                                            <span className="material-symbols-outlined text-amber-700 text-lg" title="#3 Most Contributed">emoji_events</span>
                                        ) : (
                                            <span className="text-xs font-mono text-slate-400">{idx + 1}</span>
                                        )}
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-lg border border-slate-100 group-hover:scale-110 transition-transform shrink-0">
                                        {item.icon}
                                    </div>
                                    <span className="font-semibold text-slate-700 text-sm truncate group-hover:text-emerald-600 transition-colors">{item.name}</span>
                                </div>
                                <div className="flex flex-col items-end shrink-0 pl-2">
                                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                                        {item.price}<span className="text-[10px] font-medium text-slate-400 ml-0.5">{item.unit}</span>
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
                            No data available
                        </div>
                    )}
                </div>
            </div>

            {/* Card 3: Biggest Price Drop (Right Column) */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-56 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500 text-xl">trending_down</span>
                        <h3 className="font-bold text-slate-900">Biggest Price Drop</h3>
                        <InfoTooltip text="Items with the largest percentage price drop compared to their 30-day average." />
                    </div>
                    <Link href="/markets" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
                        More <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </Link>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-3">
                    {biggestDrops.length > 0 ? (
                        biggestDrops.slice(0, 3).map((item: any, idx: number) => (
                            <Link href={`/price-index?itemId=${item.id}`} key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-xs font-mono text-slate-400 w-3 shrink-0">{idx + 1}</span>
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-lg border border-slate-100 group-hover:scale-110 transition-transform shrink-0">
                                        {item.icon}
                                    </div>
                                    <span className="font-semibold text-slate-700 text-sm truncate group-hover:text-emerald-600 transition-colors">{item.name}</span>
                                </div>
                                <div className="flex flex-col items-end shrink-0 pl-2">
                                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                                        {item.price}<span className="text-[10px] font-medium text-slate-400 ml-0.5">{item.unit}</span>
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                                        {item.trendPct.toFixed(1)}%
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
                            No major drops yet today
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
