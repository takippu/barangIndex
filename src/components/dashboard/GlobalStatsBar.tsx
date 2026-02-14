"use client";

import React from "react";

interface GlobalStatsProps {
    pulse: {
        totals: {
            totalReports: number;
            verifiedReports: number;
            pendingReports: number;
            activeMarkets: number;
            activeContributors: number;
        };
        series: { date: string; reports: number }[];
    } | null;
}

export const GlobalStatsBar: React.FC<GlobalStatsProps> = ({ pulse }) => {
    if (!pulse) return null;

    const { totals } = pulse;

    return (
        <div className="hidden lg:block w-full bg-white border-b border-slate-200 text-xs font-medium text-slate-600">
            <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Reports: </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-emerald-600 font-bold">{totals.totalReports.toLocaleString()}</span>
                            {(() => {
                                if (!pulse.series || pulse.series.length < 2) return null;

                                // Split series into two halves to compare recent vs previous
                                const midPoint = Math.floor(pulse.series.length / 2);
                                const previousPeriod = pulse.series.slice(0, midPoint);
                                const currentPeriod = pulse.series.slice(midPoint);

                                const prevSum = previousPeriod.reduce((acc, curr) => acc + curr.reports, 0);
                                const currSum = currentPeriod.reduce((acc, curr) => acc + curr.reports, 0);

                                if (prevSum === 0) return null;

                                const trendPct = ((currSum - prevSum) / prevSum) * 100;
                                const isPositive = trendPct > 0;
                                const isNeutral = trendPct === 0;

                                return (
                                    <span
                                        className={`text-[10px] font-bold flex items-center ${isPositive ? 'text-emerald-500' : isNeutral ? 'text-slate-400' : 'text-rose-500'
                                            }`}
                                        title={`vs previous ${previousPeriod.length} days`}
                                    >
                                        <span className="material-symbols-outlined text-[10px] mr-0.5" style={{ fontSize: '10px' }}>
                                            {isPositive ? 'trending_up' : isNeutral ? 'remove' : 'trending_down'}
                                        </span>
                                        {Math.abs(trendPct).toFixed(1)}%
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Verified:</span>
                        <span className="text-emerald-600">{totals.verifiedReports.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Markets:</span>
                        <span className="text-emerald-600">{totals.activeMarkets.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Contributors:</span>
                        <span className="text-emerald-600">{totals.activeContributors.toLocaleString()}</span>
                    </div>
                </div>


            </div>
        </div>
    );
};
