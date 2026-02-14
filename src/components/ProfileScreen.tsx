"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

import { apiGet, timeAgo } from "@/src/lib/api-client";

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
  };
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

  const displayName = data?.sessionUser.name ?? data?.appUser?.name ?? "User";
  const role = data?.appUser?.role ?? "user";

  return (
    <div className={`bg-[#f6f8f7] font-display text-[#1a2e21] antialiased min-h-screen pb-24 ${className}`}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
        <header className="sticky top-0 z-20 bg-[#f6f8f7]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-[#17cf5a]/10">
          <Link href="/home" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </Link>
          <div className="flex-1 px-3 text-center">
            <h1 className="text-lg font-extrabold leading-tight">My Profile</h1>
          </div>
          <div className="w-10 h-10" />
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
              {role.toUpperCase()}
            </div>
          </div>
          <h2 className="text-xl font-extrabold">{displayName}</h2>
          <p className="text-sm text-gray-500">{data?.sessionUser.email ?? "-"}</p>
        </section>

        <section className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#17cf5a]/10 border border-[#17cf5a]/20 p-4 rounded-xl text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Reputation</p>
              <p className="text-2xl font-extrabold text-[#17cf5a]">{data?.appUser?.reputation ?? 0}</p>
            </div>
            <div className="bg-[#112117] text-white shadow-lg shadow-[#17cf5a]/10 p-4 rounded-xl text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Badges</p>
              <p className="text-2xl font-extrabold text-[#17cf5a]">{data?.stats.badgeCount ?? 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reports</p>
              <p className="text-base font-extrabold">{data?.stats.totalReports ?? 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Verified Reports</p>
              <p className="text-base font-extrabold">{data?.stats.verifiedReports ?? 0}</p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">Account Status</h3>
          <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/5 text-sm">
            <p><span className="font-bold">App User ID:</span> {data?.appUser?.id ?? "-"}</p>
            <p><span className="font-bold">Joined:</span> {data?.appUser?.createdAt ? timeAgo(data.appUser.createdAt) : "-"}</p>
          </div>
          {loading && <p className="text-xs text-gray-500 mt-3">Loading profile...</p>}
          {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
        </section>
      </div>
    </div>
  );
};
