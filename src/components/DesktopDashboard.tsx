"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlobalStatsBar } from "./dashboard/GlobalStatsBar";
import { HighlightsSection } from "./dashboard/HighlightsSection";
import { DesktopHeader } from "./DesktopHeader";
import { SearchableSelect } from "@/src/components/ui/SearchableSelect";
import { formatCurrency, timeAgo, apiPost, apiDelete } from "@/src/lib/api-client";
import { getItemIcon } from "@/src/lib/item-icons";

interface DesktopDashboardProps {
    user: any;
    pulse: any;
    feed: any[];
    items: any[];
    topMovers: any[];
    mostContributed: any[];
    biggestDrops: any[];
    regions: { id: number; name: string }[];
    selectedRegionId: number | null;
    onRegionChange: (regionId: number | null) => void;
    setFeed: React.Dispatch<React.SetStateAction<any[]>>;
    setActiveCommentReportId: (id: number | null) => void;
}

const ROWS_PER_PAGE = 5;

export const DesktopDashboard: React.FC<DesktopDashboardProps> = ({
    user,
    pulse,
    feed,
    items,
    topMovers,
    mostContributed,
    biggestDrops,
    regions,
    selectedRegionId,
    onRegionChange,
    setFeed,
    setActiveCommentReportId,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(feed.length / ROWS_PER_PAGE));
    const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
    const paginatedFeed = feed.slice(startIdx, startIdx + ROWS_PER_PAGE);

    // Reset to page 1 if feed changes and current page is out of range
    React.useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [feed.length, totalPages, currentPage]);

    const getPageNumbers = () => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <DesktopHeader activeNav="/home" />
            <GlobalStatsBar pulse={pulse} />

            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* Title + Region Selector */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Groceries<span className="text-emerald-600"> prices</span> contributed by the communities.
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
                            Live price intelligence from <span className="font-semibold text-slate-900">{pulse?.totals.activeMarkets ?? '...'} markets</span> across the region.
                            The community has contributed <span className="font-semibold text-slate-900">{pulse?.totals.totalReports ?? '...'} reports</span> in the last 30 days
                            {(() => {
                                if (!pulse?.series || pulse.series.length < 2) return '.';

                                const midPoint = Math.floor(pulse.series.length / 2);
                                const previousPeriod = pulse.series.slice(0, midPoint);
                                const currentPeriod = pulse.series.slice(midPoint);

                                const prevSum = previousPeriod.reduce((acc: number, curr: any) => acc + curr.reports, 0);
                                const currSum = currentPeriod.reduce((acc: number, curr: any) => acc + curr.reports, 0);

                                if (prevSum === 0) return '.';

                                const trendPct = ((currSum - prevSum) / prevSum) * 100;
                                const isPositive = trendPct > 0;
                                const isNeutral = trendPct === 0;

                                return (
                                    <span className={`inline-flex items-baseline gap-0.5 ml-1 font-bold text-xs ${isPositive ? 'text-emerald-600' : isNeutral ? 'text-slate-400' : 'text-rose-600'
                                        }`}>
                                        <span className="material-symbols-outlined text-[14px] align-text-bottom">
                                            {isPositive ? 'trending_up' : isNeutral ? 'remove' : 'trending_down'}
                                        </span>
                                        {Math.abs(trendPct).toFixed(1)}%
                                    </span>
                                );
                            })()}.
                        </p>
                    </div>

                    {/* Region Selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Region</span>
                        <SearchableSelect
                            label="Region"
                            showLabel={false}
                            options={regions.map(r => ({ value: r.id, label: r.name }))}
                            placeholder="All Regions"
                            value={selectedRegionId}
                            onChange={(value) => {
                                onRegionChange(typeof value === 'number' ? value : null);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                {/* Highlights Section */}
                <HighlightsSection
                    pulse={pulse}
                    topMovers={topMovers}
                    mostContributed={mostContributed}
                    biggestDrops={biggestDrops}
                />

                {/* Recent Activity Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
                        <Link href="/markets" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View All Markets</Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="px-6 py-4 text-center w-16">#</th>
                                    <th className="px-6 py-4">Item Name</th>
                                    <th className="px-6 py-4 text-right">Price</th>
                                    <th className="px-6 py-4 text-center hidden md:table-cell">Status</th>
                                    <th className="px-6 py-4 text-right hidden lg:table-cell">Reporter</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedFeed.map((row, idx) => {
                                    const itemIcon = getItemIcon(row.itemName);

                                    return (
                                        <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 text-center text-slate-400 text-sm font-medium">{startIdx + idx + 1}</td>
                                            <td className="px-6 py-4">
                                                <Link href={`/price-index?itemId=${row.itemId}`} className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">
                                                        {itemIcon}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{row.itemName}</p>
                                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[10px]">store</span>
                                                            {row.marketName}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-bold text-slate-900 text-sm">{formatCurrency(row.price)}</div>
                                                <div className="text-xs text-slate-400">{timeAgo(row.reportedAt)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center hidden md:table-cell">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${row.status === 'verified' ? 'text-emerald-700 bg-emerald-50' :
                                                    row.status === 'pending' ? 'text-amber-700 bg-amber-50' :
                                                        'text-rose-700 bg-rose-50'
                                                    }`}>
                                                    {row.status === 'verified' && <span className="material-symbols-outlined text-[12px]">verified</span>}
                                                    {row.status === 'pending' && <span className="material-symbols-outlined text-[12px]">schedule</span>}
                                                    {row.status === 'rejected' && <span className="material-symbols-outlined text-[12px]">cancel</span>}
                                                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-slate-600 hidden lg:table-cell">
                                                {row.reporterName || 'Community Reporter'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/price-index?itemId=${row.itemId}`}
                                                        className="flex items-center gap-1 text-slate-400 hover:text-sky-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-sky-50"
                                                        title="View Details"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className={`flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 ${row.hasHelpfulVote ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                                                        onClick={async () => {
                                                            const wasVoted = row.hasHelpfulVote;
                                                            setFeed((prev: any[]) => prev.map((r: any) => r.id === row.id ? {
                                                                ...r,
                                                                hasHelpfulVote: !wasVoted,
                                                                helpfulCount: wasVoted ? r.helpfulCount - 1 : r.helpfulCount + 1,
                                                            } : r));
                                                            try {
                                                                if (wasVoted) {
                                                                    await apiDelete(`/api/v1/price-reports/${row.id}/vote`);
                                                                } else {
                                                                    await apiPost(`/api/v1/price-reports/${row.id}/vote`, {});
                                                                }
                                                            } catch {
                                                                setFeed((prev: any[]) => prev.map((r: any) => r.id === row.id ? {
                                                                    ...r,
                                                                    hasHelpfulVote: wasVoted,
                                                                    helpfulCount: wasVoted ? r.helpfulCount + 1 : r.helpfulCount - 1,
                                                                } : r));
                                                            }
                                                        }}
                                                    >
                                                        <span className={`material-symbols-outlined text-[16px] ${row.hasHelpfulVote ? 'fill-1' : ''}`}>thumb_up</span>
                                                        <span className="text-xs font-bold">{row.helpfulCount > 0 ? row.helpfulCount : ''}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
                                                        onClick={() => setActiveCommentReportId(row.id)}
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                                                        <span className="text-xs font-bold">{row.commentCount > 0 ? row.commentCount : ''}</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {feed.length === 0 && (
                            <div className="p-12 text-center text-slate-500 text-sm">
                                No recent data available.
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {feed.length > 0 && (
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            <div className="text-xs text-slate-500 font-medium">
                                Showing {startIdx + 1} - {Math.min(startIdx + ROWS_PER_PAGE, feed.length)} of {feed.length} reports
                            </div>
                            <div className="flex gap-1.5">
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                >
                                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                                </button>
                                {getPageNumbers().map((page, i) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${currentPage === page
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                                                }`}
                                            onClick={() => setCurrentPage(page as number)}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                >
                                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};
