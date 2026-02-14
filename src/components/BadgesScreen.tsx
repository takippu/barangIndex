"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiGet } from "@/src/lib/api-client";
import { DesktopHeader } from "@/src/components/DesktopHeader";

type BadgeInfo = {
    name: string;
    description: string;
    requirement: string;
    earned: boolean;
    awardedAt: string | null;
};

const BADGE_ICONS: Record<string, string> = {
    "First Reporter": "edit_note",
    "Trend Setter": "local_fire_department",
    "Veteran Reporter": "military_tech",
    "Accuracy Star": "verified",
    "Community Helper": "volunteer_activism",
};

const BADGE_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    "First Reporter": { bg: "from-emerald-50 to-green-50", border: "border-emerald-200", text: "text-emerald-600", glow: "bg-emerald-500/20" },
    "Trend Setter": { bg: "from-amber-50 to-yellow-50", border: "border-amber-200", text: "text-amber-600", glow: "bg-amber-500/20" },
    "Veteran Reporter": { bg: "from-violet-50 to-purple-50", border: "border-violet-200", text: "text-violet-600", glow: "bg-violet-500/20" },
    "Accuracy Star": { bg: "from-blue-50 to-cyan-50", border: "border-blue-200", text: "text-blue-600", glow: "bg-blue-500/20" },
    "Community Helper": { bg: "from-rose-50 to-pink-50", border: "border-rose-200", text: "text-rose-600", glow: "bg-rose-500/20" },
};

const DEFAULT_COLOR = { bg: "from-slate-50 to-slate-100", border: "border-slate-200", text: "text-slate-600", glow: "bg-slate-500/20" };

export const BadgesScreen: React.FC = () => {
    const router = useRouter();
    const [badges, setBadges] = useState<BadgeInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const result = await apiGet<{ badges: BadgeInfo[] }>("/api/v1/badges");
                if (mounted) setBadges(result.badges);
            } catch {
                // fail silently
            } finally {
                if (mounted) setLoading(false);
            }
        };
        void load();
        return () => { mounted = false; };
    }, []);

    const earned = badges.filter((b) => b.earned);
    const locked = badges.filter((b) => !b.earned);

    return (
        <div
            className="bg-slate-50 text-slate-900 antialiased min-h-screen"
            style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}
        >
            <DesktopHeader activeNav="/badges" showSubmitButton={false} />
            
            <div className="max-w-md mx-auto lg:max-w-7xl lg:px-6 min-h-screen flex flex-col relative">
                <div className="lg:bg-white lg:rounded-3xl lg:shadow-xl lg:shadow-slate-200/50 lg:border lg:border-slate-100 lg:mt-6 lg:overflow-hidden lg:p-8">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl px-4 py-3 pb-4 border-b border-slate-200/50 flex items-center justify-between">
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-soft hover:bg-slate-50 transition-colors text-slate-600"
                        onClick={() => router.back()}
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                    <div className="flex-1 px-4 text-center">
                        <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Achievement</h1>
                        <h2 className="text-base font-extrabold text-slate-900 leading-tight">All Badges</h2>
                    </div>
                    <span className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary-600">military_tech</span>
                    </span>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <main className="px-4 py-6 space-y-6">
                        {/* Summary */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft text-center">
                            <p className="text-4xl font-extrabold text-slate-900">{earned.length}<span className="text-slate-300">/{badges.length}</span></p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Badges Unlocked</p>
                            <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                                <div
                                    className="bg-gradient-to-r from-primary-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${badges.length > 0 ? (earned.length / badges.length) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Earned Badges */}
                        {earned.length > 0 && (
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
                                    Earned
                                </h3>
                                <div className="space-y-3">
                                    {earned.map((badge) => {
                                        const colors = BADGE_COLORS[badge.name] ?? DEFAULT_COLOR;
                                        return (
                                            <div
                                                key={badge.name}
                                                className={`bg-gradient-to-br ${colors.bg} rounded-2xl border ${colors.border} p-5 shadow-soft relative overflow-hidden`}
                                            >
                                                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${colors.glow} blur-2xl pointer-events-none`} />
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`w-14 h-14 rounded-2xl bg-white border ${colors.border} shadow-sm flex items-center justify-center`}>
                                                        <span className={`material-symbols-outlined text-3xl ${colors.text}`}>
                                                            {BADGE_ICONS[badge.name] ?? "military_tech"}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-extrabold text-slate-900">{badge.name}</p>
                                                        <p className="text-xs text-slate-600 font-medium mt-0.5">{badge.description}</p>
                                                        {badge.awardedAt && (
                                                            <p className="text-[10px] text-slate-400 font-medium mt-1">
                                                                Earned {new Date(badge.awardedAt).toLocaleDateString("en-MY", { month: "short", day: "numeric", year: "numeric" })}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className={`material-symbols-outlined text-2xl ${colors.text}`}>check_circle</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Locked Badges */}
                        {locked.length > 0 && (
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
                                    Locked
                                </h3>
                                <div className="space-y-3">
                                    {locked.map((badge) => (
                                        <div
                                            key={badge.name}
                                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm opacity-60"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-3xl text-slate-300">lock</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-extrabold text-slate-500">{badge.name}</p>
                                                    <p className="text-xs text-slate-400 font-medium mt-0.5">{badge.description}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px]">info</span>
                                                        {badge.requirement}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>
                )}
                </div>
            </div>
        </div>
    );
};
