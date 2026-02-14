"use client";

import { AppBottomNav } from "@/src/components/AppBottomNav";
import { DesktopHeader } from "@/src/components/DesktopHeader";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { apiGet } from "@/src/lib/api-client";
import { ProfileScreenSkeleton } from "@/src/components/ui/Skeleton";

interface ProfileScreenProps {
  readonly className?: string;
}

type ProfilePayload = {
  sessionUser: {
    name: string | null;
    email: string;
    image: string | null;
  };
  appUser: {
    id: number;
    email: string;
    name: string | null;
    role: string;
    reputation: number;
    reportCount: number;
    verifiedReportCount: number;
    createdAt: string;
  } | null;
  stats: {
    totalReports: number;
    verifiedReports: number;
    badgeCount: number;
    marketsCovered: number;
    helpfulVotes: number;
  };
  badges: Array<{
    id: number;
    name: string;
    description: string | null;
    awardedAt: string;
  }>;
  recentActivity: Array<{
    reportId: number;
    itemName: string;
    marketName: string;
    status: "pending" | "verified" | "rejected";
    price: string;
    currency: string;
    createdAt: string;
    helpfulVotes: number;
    reputationDelta: number;
  }>;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ className = "" }) => {
  const router = useRouter();
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await apiGet<ProfilePayload>("/api/v1/profile/me");
        if (!mounted) return;
        setData(payload);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const displayName = data?.sessionUser.name ?? data?.appUser?.name ?? "Community User";
  const email = data?.sessionUser.email ?? "-";
  const role = data?.appUser?.role ?? "user";
  const totalReports = data?.stats.totalReports ?? 0;
  const verifiedReports = data?.stats.verifiedReports ?? 0;
  const verifiedRate = totalReports > 0 ? Math.round((verifiedReports / totalReports) * 100) : 0;
  const badgeCount = data?.stats.badgeCount ?? 0;
  const reputation = data?.appUser?.reputation ?? 0;
  const level = Math.max(1, Math.floor(reputation / 200) + 1);
  const roleLabel =
    role === "admin" ? "Market Admin" : role === "moderator" ? "Market Analyst" : "Community Reporter";

  const helper = useMemo(() => {
    const marketsCovered = data?.stats.marketsCovered ?? 0;
    const helpfulVotes = data?.stats.helpfulVotes ?? 0;
    const savingsHelped = Math.max(0, Math.round(verifiedReports * 2.4));
    return { marketsCovered, helpfulVotes, savingsHelped };
  }, [data?.stats.helpfulVotes, data?.stats.marketsCovered, verifiedReports]);

  const activities = useMemo(
    () =>
      (data?.recentActivity ?? []).map((activity) => {
        const statusIcon =
          activity.status === "verified" ? "check_circle" : activity.status === "pending" ? "schedule" : "cancel";
        const iconClass =
          activity.status === "verified"
            ? "text-blue-500 bg-blue-500/10"
            : activity.status === "pending"
              ? "text-orange-500 bg-orange-500/10"
              : "text-red-500 bg-red-500/10";
        return {
          id: activity.reportId,
          icon: statusIcon,
          iconClass,
          title: `${activity.itemName} at ${activity.marketName}`,
          subtitle: `${activity.currency} ${activity.price} • ${activity.helpfulVotes} helpful`,
          points: `${activity.reputationDelta >= 0 ? "+" : ""}${activity.reputationDelta} pts`,
          time: new Date(activity.createdAt).toLocaleDateString("en-MY", {
            month: "short",
            day: "numeric",
          }),
        };
      }),
    [data?.recentActivity],
  );

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
    } finally {
      router.push("/login");
    }
  };

  return (
    <div
      className={`bg-slate-50 text-slate-900 antialiased min-h-screen ${className}`}
      style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}
    >
      <DesktopHeader activeNav="/profile" />

      {/* Mobile Layout - Original */}
      <div className="lg:hidden max-w-md mx-auto min-h-screen flex flex-col relative">
        <div className="min-h-screen flex flex-col relative">
          {/* Header Background */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-slate-900/5 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent"></div>
          </div>

          <header className="sticky top-0 z-20 bg-slate-50/0 backdrop-blur-none px-4 py-4 flex items-center justify-between">
            <div className="flex-1 text-center"></div>
          </header>

          <section className="px-4 pt-4 pb-2 text-center relative z-10">
            <div className="relative inline-block mb-3">
              <div className="w-28 h-28 rounded-full bg-white p-1 shadow-soft mx-auto relative group">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-100">
                  {data?.sessionUser.image ? (
                    <img alt="Profile" className="w-full h-full object-cover" src={data.sessionUser.image} />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300">person</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{displayName}</h2>
            <div className="flex items-center justify-center gap-1.5 mt-1 text-primary-600">
              <span className="material-symbols-outlined text-lg">verified</span>
              <span className="text-sm font-bold uppercase tracking-wide">{roleLabel}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">{email}</p>
          </section>

          <section className="px-4 py-4 relative z-10">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 text-center relative overflow-hidden shadow-soft group hover:-translate-y-0.5 transition-transform">
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-5xl text-primary-600">savings</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Savings Helped</p>
                <p className="text-2xl font-extrabold text-primary-600">RM {helper.savingsHelped}</p>
              </div>
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-center relative overflow-hidden shadow-soft group hover:-translate-y-0.5 transition-transform">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-5xl text-emerald-400">stars</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reputation</p>
                <p className="text-2xl font-extrabold text-white tracking-tight">{reputation.toLocaleString()}</p>
              </div>
            </div>
          </section>

          <section className="px-4 py-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">Impact Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Reports</p>
                <p className="text-lg font-extrabold text-slate-900">{totalReports}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">Community Contributor</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Accuracy</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-lg font-extrabold text-slate-900">{verifiedRate}%</p>
                  {verifiedRate > 80 && <span className="material-symbols-outlined text-primary-600 text-sm">verified</span>}
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">Reliability Score</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Markets</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-500" />
                  <p className="text-lg font-extrabold text-slate-900">{helper.marketsCovered}</p>
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">Coverage Area</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Helpful</p>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-slate-300 text-sm">thumb_up</span>
                  <p className="text-lg font-extrabold text-slate-900">{helper.helpfulVotes}</p>
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">Community Votes</p>
              </div>
            </div>
          </section>

          <section className="px-4 py-6">
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Badges Earned</h3>
              <button className="text-primary-600 text-xs font-bold hover:text-primary-700 transition-colors" type="button" onClick={() => router.push("/badges")}>View All</button>
            </div>
            {badgeCount > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
                {(data?.badges ?? []).map((badge) => (
                  <div className="min-w-[100px] flex flex-col items-center gap-2 snap-center" key={badge.id}>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-emerald-50 border border-primary-100 flex items-center justify-center shadow-sm text-primary-600">
                      <span className="material-symbols-outlined text-3xl">military_tech</span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{badge.name}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mt-0.5">{badge.description ?? "Earned badge"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">military_tech</span>
                <p className="text-sm font-bold text-slate-500">No badges yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Submit and verify price reports to unlock your first community badge.</p>
              </div>
            )}
          </section>

          <section className="px-4 pb-32">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Recent Activity</h3>
            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div className="flex items-start gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm" key={activity.id}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${activity.icon === 'check_circle' ? 'bg-primary-50 border-primary-100 text-primary-600' :
                      activity.icon === 'schedule' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                        'bg-rose-50 border-rose-100 text-rose-600'
                      }`}>
                      <span className="material-symbols-outlined text-xl">{activity.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-bold text-slate-900 truncate">{activity.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{activity.subtitle}</p>
                    </div>
                    <div className="text-right pt-0.5">
                      <span className="text-xs font-extrabold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{activity.points}</span>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No recent activity yet.
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">Account</h3>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
                className="w-full bg-white border border-rose-200 text-rose-600 rounded-xl py-3.5 px-4 text-sm font-bold hover:bg-rose-50 transition-colors disabled:opacity-60 shadow-sm flex items-center justify-center gap-2"
              >
                {loggingOut ? (
                  <>
                    <span className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></span>
                    Logging out...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Log Out
                  </>
                )}
              </button>
            </div>

            {loading && <ProfileScreenSkeleton />}
            {error && <div className="text-xs text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100 mt-3 text-center">{error}</div>}
          </section>
        </div>
      </div>

      {/* Desktop Layout - Consistent with Mobile Styles */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 py-6">
        {/* Header Background Effect - Extended for desktop */}
        <div className="relative">
          <div className="absolute -top-6 left-0 right-0 h-64 bg-slate-900/5 z-0 overflow-hidden pointer-events-none rounded-3xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
          </div>

          <div className="relative z-10 grid grid-cols-12 gap-6">
            {/* Left Column - Profile Card */}
            <div className="col-span-12 xl:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8 text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-32 h-32 rounded-full bg-white p-1 shadow-soft mx-auto relative group">
                      <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-100">
                        {data?.sessionUser.image ? (
                          <img alt="Profile" className="w-full h-full object-cover" src={data.sessionUser.image} />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300">person</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{displayName}</h2>
                  <div className="flex items-center justify-center gap-1.5 mt-2 text-primary-600">
                    <span className="material-symbols-outlined text-lg">verified</span>
                    <span className="text-sm font-bold uppercase tracking-wide">{roleLabel}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 font-medium">{email}</p>
                </div>

                {/* Savings & Reputation Cards - Same as mobile */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 text-center relative overflow-hidden shadow-soft group hover:-translate-y-0.5 transition-transform">
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-5xl text-primary-600">savings</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Savings Helped</p>
                    <p className="text-2xl font-extrabold text-primary-600">RM {helper.savingsHelped}</p>
                  </div>
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-center relative overflow-hidden shadow-soft group hover:-translate-y-0.5 transition-transform">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-5xl text-emerald-400">stars</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reputation</p>
                    <p className="text-2xl font-extrabold text-white tracking-tight">{reputation.toLocaleString()}</p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                  className="w-full bg-white border border-rose-200 text-rose-600 rounded-2xl py-4 px-4 text-sm font-bold hover:bg-rose-50 transition-colors disabled:opacity-60 shadow-sm flex items-center justify-center gap-2"
                >
                  {loggingOut ? (
                    <>
                      <span className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></span>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Log Out
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Stats, Badges, Activity */}
            <div className="col-span-12 xl:col-span-8 space-y-6">
              {/* Impact Stats Section */}
              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Impact Stats</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Reports</p>
                    <p className="text-xl font-extrabold text-slate-900">{totalReports}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">Community Contributor</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Accuracy</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xl font-extrabold text-slate-900">{verifiedRate}%</p>
                      {verifiedRate > 80 && <span className="material-symbols-outlined text-primary-600 text-sm">verified</span>}
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">Reliability Score</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Markets</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary-500" />
                      <p className="text-xl font-extrabold text-slate-900">{helper.marketsCovered}</p>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">Coverage Area</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Helpful</p>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-slate-300 text-sm">thumb_up</span>
                      <p className="text-xl font-extrabold text-slate-900">{helper.helpfulVotes}</p>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">Community Votes</p>
                  </div>
                </div>
              </div>

              {/* Badges Section */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Badges Earned</h3>
                  <button className="text-primary-600 text-xs font-bold hover:text-primary-700 transition-colors" type="button" onClick={() => router.push("/badges")}>View All</button>
                </div>
                {badgeCount > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {(data?.badges ?? []).map((badge) => (
                      <div className="flex flex-col items-center gap-2 min-w-[100px]" key={badge.id}>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-emerald-50 border border-primary-100 flex items-center justify-center shadow-sm text-primary-600">
                          <span className="material-symbols-outlined text-3xl">military_tech</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{badge.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mt-0.5 max-w-[100px]">{badge.description ?? "Earned badge"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">military_tech</span>
                    <p className="text-sm font-bold text-slate-500">No badges yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[300px] mx-auto">Submit and verify price reports to unlock your first community badge.</p>
                  </div>
                )}
              </div>

              {/* Recent Activity Section */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div
                        className="flex items-start gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        key={activity.id}
                        onClick={() => router.push(`/reports/${activity.id}`)}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${activity.icon === 'check_circle' ? 'bg-primary-50 border-primary-100 text-primary-600' :
                          activity.icon === 'schedule' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                            'bg-rose-50 border-rose-100 text-rose-600'
                          }`}>
                          <span className="material-symbols-outlined text-xl">{activity.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm font-bold text-slate-900 truncate">{activity.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{activity.subtitle}</p>
                        </div>
                        <div className="text-right pt-0.5">
                          <span className="text-xs font-extrabold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{activity.points}</span>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                      No recent activity yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && <ProfileScreenSkeleton />}
        {error && <div className="text-sm text-rose-500 bg-rose-50 p-4 rounded-xl border border-rose-100 mt-6 text-center">{error}</div>}
      </div>

      <AppBottomNav />
    </div>
  );
};
