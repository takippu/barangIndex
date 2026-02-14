"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import { apiGet } from "@/src/lib/api-client";

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
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div
      className={`bg-[#f6f8f7] text-[#1a2e21] antialiased min-h-screen ${className}`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="max-w-md mx-auto min-h-screen flex flex-col pb-24">
        <header className="sticky top-0 z-20 bg-[#f6f8f7]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-[#17cf5a]/10">
          <Link href="/home" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors" aria-label="Back to home">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </Link>
          <div className="flex-1 px-3 text-center">
            <h1 className="text-lg font-extrabold leading-tight">My Reputation</h1>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors" type="button" aria-label="Settings">
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>
        </header>

        <section className="px-4 pt-6 pb-2 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-[#17cf5a]/20 flex items-center justify-center mx-auto overflow-hidden border-4 border-white shadow-xl">
              {data?.sessionUser.image ? (
                <img alt="Profile" className="w-full h-full object-cover" src={data.sessionUser.image} />
              ) : (
                <span className="material-symbols-outlined text-4xl text-[#17cf5a]">person</span>
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-[#17cf5a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
              LVL {level}
            </div>
          </div>
          <h2 className="text-xl font-extrabold">{displayName}</h2>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-[#17cf5a]">
            <span className="material-symbols-outlined text-lg">verified</span>
            <span className="text-sm font-bold uppercase tracking-wide">{roleLabel}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{email}</p>
        </section>

        <section className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#17cf5a]/10 p-4 rounded-xl border border-[#17cf5a]/20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <span className="material-symbols-outlined text-4xl text-[#17cf5a]">savings</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Savings Helped</p>
              <p className="text-2xl font-extrabold text-[#17cf5a]">RM {helper.savingsHelped}</p>
            </div>
            <div className="bg-[#112117] text-white p-4 rounded-xl border border-[#17cf5a]/20 text-center relative overflow-hidden shadow-lg shadow-[#17cf5a]/10">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <span className="material-symbols-outlined text-4xl text-[#17cf5a]">stars</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reputation Points</p>
              <p className="text-2xl font-extrabold text-[#17cf5a]">{reputation.toLocaleString()}</p>
            </div>
          </div>
        </section>

        <section className="px-4 py-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 px-1">Impact Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reports Submitted</p>
              <p className="text-base font-extrabold">{totalReports}</p>
              <p className="text-[10px] font-medium text-gray-400">Community Contributor</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Accuracy Rate</p>
              <div className="flex items-center gap-1.5">
                <p className="text-base font-extrabold text-[#17cf5a]">{verifiedRate}%</p>
                <span className="material-symbols-outlined text-[#17cf5a] text-sm">verified</span>
              </div>
              <p className="text-[10px] font-medium text-gray-400">High Reliability</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Markets Covered</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#17cf5a]" />
                <p className="text-base font-extrabold">{helper.marketsCovered}</p>
              </div>
              <p className="text-[10px] font-medium text-gray-400">Selected area</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Helpful Votes</p>
              <p className="text-base font-extrabold">{helper.helpfulVotes}</p>
              <p className="text-[10px] font-medium text-gray-400">+ community support</p>
            </div>
          </div>
        </section>

        <section className="px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Badges Earned</h3>
            <button className="text-[#17cf5a] text-xs font-bold" type="button">View All</button>
          </div>
          {badgeCount > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {(data?.badges ?? []).map((badge) => (
                <div className="min-w-[110px] flex flex-col items-center gap-2" key={badge.id}>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#17cf5a]/20 to-[#17cf5a]/5 border-2 border-[#17cf5a]/40 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-3xl text-[#17cf5a]">military_tech</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold line-clamp-1">{badge.name}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-2">{badge.description ?? "Earned badge"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#17cf5a]/30 p-4 text-center text-sm text-gray-500">
              No badges yet. Submit and verify more reports to unlock your first badge.
            </div>
          )}
        </section>

        <section className="px-4 pb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 px-1">Recent Activity</h3>
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#17cf5a]/5" key={activity.id}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.iconClass}`}>
                    <span className="material-symbols-outlined text-xl">{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#17cf5a]">{activity.points}</span>
                    <p className="text-[10px] text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[#17cf5a]/30 p-4 text-sm text-gray-500">
                No recent activity yet.
              </div>
            )}
          </div>

          {loading && <p className="text-xs text-gray-500 mt-3">Loading profile...</p>}
          {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
        </section>
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-lg border-t border-[#17cf5a]/10 px-6 py-3 flex justify-between items-center z-30">
        <Link className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#17cf5a] transition-colors" href="/home">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#17cf5a] transition-colors" href="/markets">
          <span className="material-symbols-outlined">monitoring</span>
          <span className="text-[10px] font-bold">Markets</span>
        </Link>
        <div className="relative -top-6">
          <Link className="w-14 h-14 bg-[#17cf5a] text-white rounded-full shadow-lg shadow-[#17cf5a]/40 flex items-center justify-center active:scale-95 transition-transform" href="/submit">
            <span className="material-symbols-outlined text-3xl">add</span>
          </Link>
        </div>
        <Link className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#17cf5a] transition-colors" href="/reports">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[10px] font-bold">Alerts</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-[#17cf5a]" href="/profile">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </div>
  );
};
