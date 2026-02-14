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
        {/* Search bar */}
        <Skeleton className="h-12 w-full rounded-xl" />
        {/* Filter pills */}
        <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        {/* Result cards */}
        {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
    </div>
);

/** MarketsScreen skeleton */
export const MarketsScreenSkeleton: React.FC = () => (
    <div className="space-y-3 px-4 py-4">
        {/* Header */}
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64 mb-2" />
        {/* Search */}
        <Skeleton className="h-11 w-full rounded-xl" />
        {/* Item cards */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
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
