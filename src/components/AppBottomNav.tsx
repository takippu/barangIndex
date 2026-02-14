"use client";

import Link from "next/link";
import React from "react";

type AppBottomNavProps = {
  readonly active: "home" | "items" | "profile";
};

export const AppBottomNav: React.FC<AppBottomNavProps> = ({ active }) => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-[#17cf5a]/10 px-6 py-3 flex justify-between items-center z-30">
      {[
        { key: "home", label: "Home", icon: "home", href: "/home" },
        { key: "items", label: "Items", icon: "inventory_2", href: "/markets" },
      ].map((item) => (
        <Link
          key={item.key}
          className={`flex flex-col items-center gap-1 transition-colors ${
            active === item.key ? "text-[#17cf5a]" : "text-gray-400 hover:text-[#17cf5a]"
          }`}
          href={item.href}
        >
          <span className={`material-symbols-outlined ${active === item.key ? "fill-1" : ""}`}>{item.icon}</span>
          <span className="text-[10px] font-bold">{item.label}</span>
        </Link>
      ))}
      <div className="relative -top-6">
        <Link
          href="/submit"
          className="w-14 h-14 bg-[#17cf5a] text-white rounded-full shadow-lg shadow-[#17cf5a]/40 flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </Link>
      </div>
      <Link className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#17cf5a] transition-colors" href="#">
        <span className="material-symbols-outlined">notifications</span>
        <span className="text-[10px] font-bold">Alerts</span>
      </Link>
      <Link
        className={`flex flex-col items-center gap-1 transition-colors ${
          active === "profile" ? "text-[#17cf5a]" : "text-gray-400 hover:text-[#17cf5a]"
        }`}
        href="/profile"
      >
        <span className={`material-symbols-outlined ${active === "profile" ? "fill-1" : ""}`}>person</span>
        <span className="text-[10px] font-bold">Profile</span>
      </Link>
    </nav>
  );
};
