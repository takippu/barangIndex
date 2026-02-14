"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type UnreadCountResponse = {
  notifications: unknown[];
  unreadCount: number;
  pagination: { limit: number; offset: number };
};

export const AppBottomNav: React.FC = () => {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Determine active state from pathname
  const isHomeActive = pathname === "/home";
  const isMarketsActive = pathname === "/markets" || pathname.startsWith("/markets/");
  const isAlertsActive = pathname === "/alerts";
  const isProfileActive = pathname === "/profile" || pathname.startsWith("/profile/");

  // Fetch unread count on mount and when pathname changes
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/v1/notifications?limit=1", {
          credentials: "include",
        });
        if (res.ok) {
          const data: UnreadCountResponse = await res.json();
          setUnreadCount(data.unreadCount);
        }
      } catch {
        // Silently fail - badge just won't show
      }
    };

    void fetchUnreadCount();
  }, [pathname]);

  return (
    <div className="fixed bottom-0 left-0 w-full px-4 pb-4 pt-2 pointer-events-none z-50 flex justify-center lg:hidden">
      <nav className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-2xl w-full max-w-md px-2 py-2 flex items-center justify-around relative isolation-auto">
        <Link
          href="/home"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${isHomeActive ? "text-primary-600 bg-primary-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
        >
          <span className={`material-symbols-outlined text-2xl ${isHomeActive ? "fill-1" : ""}`}>home</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        <Link
          href="/markets"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${isMarketsActive ? "text-primary-600 bg-primary-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
        >
          <span className={`material-symbols-outlined text-2xl ${isMarketsActive ? "fill-1" : ""}`}>inventory_2</span>
          <span className="text-[10px] font-bold">Markets</span>
        </Link>

        <div className="relative -top-8">
          <Link
            href="/submit"
            className="w-14 h-14 bg-[#0F172A] text-white rounded-full shadow-[0_8px_16px_rgba(15,23,42,0.3)] flex items-center justify-center hover:scale-105 transition-transform active:scale-95 group border-[4px] border-white"
          >
            <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
          </Link>
        </div>

        <Link
          href="/alerts"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative ${isAlertsActive ? "text-primary-600 bg-primary-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
        >
          <span className={`material-symbols-outlined text-2xl ${isAlertsActive ? "fill-1" : ""}`}>notifications</span>
          <span className="text-[10px] font-bold">Alerts</span>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${isProfileActive ? "text-primary-600 bg-primary-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
        >
          <span className={`material-symbols-outlined text-2xl ${isProfileActive ? "fill-1" : ""}`}>person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </div>
  );
};
