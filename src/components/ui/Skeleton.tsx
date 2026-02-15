"use client";

import React from "react";

interface SkeletonProps {
    className?: string;
}

/** A single pulsing block */
export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
    <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
);

/** Circle skeleton for avatars */
export const SkeletonCircle: React.FC<SkeletonProps> = ({ className = "" }) => (
    <div className={`animate-pulse rounded-full bg-gray-200 ${className}`} />
);

/* ============================================================
   Per-page skeleton layouts
   ============================================================ */

/** HomeScreen skeleton */
export const HomeScreenSkeleton: React.FC = () => (
    <div className="space-y-6 px-4 py-4">
        {/* Region selector */}
        <Skeleton className="h-10 w-full rounded-xl" />

        {/* Pulse Stats */}
        <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
        </div>

        {/* Top movers */}
        <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
            </div>
        </div>

        {/* Quick items */}
        <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-3 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 w-20 rounded-xl shrink-0" />
                ))}
            </div>
        </div>

        {/* Recent activity */}
        <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
        </div>
    </div>
);

/** SearchScreen skeleton */
export const SearchScreenSkeleton: React.FC = () => (
    <div className="space-y-4 px-4 py-4">
        {/* Result cards */}
        {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
    </div>
);

/** MarketsScreen Mobile Card skeleton */
export const MarketsCardSkeleton: React.FC = () => (
    <div className="space-y-3 px-4 py-4">
        {/* Item cards */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
    </div>
);

/** MarketsScreen Desktop Table skeleton */
export const MarketsTableSkeleton: React.FC = () => (
    <div className="w-full">
        <div className="border-b border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-lg" /> {/* Icon */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <div className="ml-auto flex gap-8">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-6 px-6 py-4 border-b border-slate-50 last:border-none">
                <Skeleton className="h-4 w-8" /> {/* Rank/Index */}
                <div className="flex items-center gap-3 w-1/3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <div className="flex-1 flex justify-end">
                    <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex-1 flex justify-end">
                    <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex-1 flex justify-center">
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="flex-1 flex justify-center">
                    <Skeleton className="h-5 w-12" />
                </div>
                <div className="flex-1 flex justify-end">
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        ))}
    </div>
);

/** MarketDetailScreen skeleton */
export const MarketDetailScreenSkeleton: React.FC = () => (
    <div className="space-y-4 px-4 py-4">
        {/* Market info card */}
        <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-36" />
            <div className="grid grid-cols-3 gap-2 mt-2">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
            </div>
            <Skeleton className="h-10 w-36 rounded-xl mt-2" />
        </div>
        {/* Prices */}
        <Skeleton className="h-4 w-24" />
        {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
    </div>
);

/** ProfileScreen skeleton */
export const ProfileScreenSkeleton: React.FC = () => (
    <div className="space-y-4 px-4 pt-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
            <SkeletonCircle className="w-20 h-20" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-48" />
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
        </div>
        {/* Badges */}
        <Skeleton className="h-4 w-20 mt-4" />
        <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-xl" />
            ))}
        </div>
        {/* Recent */}
        <Skeleton className="h-4 w-32 mt-4" />
        {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
    </div>
);

/** ReportDetailScreen skeleton */
export const ReportDetailScreenSkeleton: React.FC = () => (
    <div className="space-y-4 px-4 py-4">
        {/* Item card */}
        <div className="rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-11 h-11 rounded-xl" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
                <div className="space-y-1.5 text-right">
                    <Skeleton className="h-5 w-20 ml-auto" />
                    <Skeleton className="h-3 w-14 ml-auto" />
                </div>
            </div>
            <div className="flex items-center justify-between mt-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
        </div>
        {/* Location */}
        <div className="rounded-2xl border border-gray-100 p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
        </div>
        {/* Actions */}
        <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
            <Skeleton className="h-3 w-28" />
            <div className="flex gap-2">
                <SkeletonCircle className="w-11 h-11" />
                <SkeletonCircle className="w-11 h-11" />
                <Skeleton className="h-11 w-20 rounded-full ml-auto" />
            </div>
        </div>
        {/* Comments */}
        <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
            <Skeleton className="h-3 w-20" />
            {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
        </div>
    </div>
);

/** PriceIndexScreen skeleton */
export const PriceIndexScreenSkeleton: React.FC = () => (
    <div className="space-y-4 px-4 py-4">
        {/* Item selector */}
        <Skeleton className="h-12 w-full rounded-xl" />
        {/* Chart area */}
        <Skeleton className="h-48 w-full rounded-2xl" />
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
        </div>
        {/* Table */}
        <Skeleton className="h-4 w-32" />
        {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
    </div>
);

/** SubmitScreen skeleton */
export const SubmitScreenSkeleton: React.FC = () => (
    <div className="space-y-5 px-4 py-4">
        {/* Region */}
        <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        {/* Market */}
        <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        {/* Item */}
        <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        {/* Price */}
        <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        {/* Submit button */}
        <Skeleton className="h-14 w-full rounded-xl mt-4" />
    </div>
);
