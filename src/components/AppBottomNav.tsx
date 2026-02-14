"use client";

import Link from "next/link";
import React from "react";

type AppBottomNavProps = {
  readonly active: "home" | "items" | "profile";
};

export const AppBottomNav: React.FC<AppBottomNavProps> = ({ active }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full px-4 pb-4 pt-2 pointer-events-none z-50 flex justify-center">
      <nav className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-2xl w-full max-w-md px-2 py-2 flex items-center justify-around relative isolation-auto">
        <Link
          href="/home"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${active === "home" ? "text-primary-600 bg-primary-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
        >
          <span className={`material-symbols-outlined text-2xl ${active === "home" ? "fill-1" : ""}`}>home</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        <Link
          href="/markets"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${active === "items" ? "text-primary-600 bg-primary-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
        >
          <span className={`material-symbols-outlined text-2xl ${active === "items" ? "fill-1" : ""}`}>inventory_2</span>
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
          href="#"
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
          onClick={(e) => e.preventDefault()}
          title="Alerts"
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
          <span className="text-[10px] font-bold">Alerts</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${active === "profile" ? "text-primary-600 bg-primary-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
        >
          <span className={`material-symbols-outlined text-2xl ${active === "profile" ? "fill-1" : ""}`}>person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </div>
  );
};
