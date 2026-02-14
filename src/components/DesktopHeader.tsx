"use client";

import React from "react";
import Link from "next/link";

interface NavItem {
  href: string;
  label: string;
  active?: boolean;
}

interface DesktopHeaderProps {
  activeNav?: string;
  showSubmitButton?: boolean;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  activeNav = "",
  showSubmitButton = true
}) => {
  const navItems: NavItem[] = [
    { href: "/home", label: "Home" },
    { href: "/markets", label: "Markets" },
    { href: "/alerts", label: "Alerts" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-base">shopping_basket</span>
          </div>
          <span className="font-bold text-slate-900">
            Grocery<span className="text-sky-600">Index</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeNav === item.href
                  ? "text-sky-600 bg-sky-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {showSubmitButton ? (
          <Link
            href="/submit"
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Submit Price
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

// Simple header for public pages (no auth required)
export const PublicDesktopHeader: React.FC = () => {
  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-base">shopping_basket</span>
          </div>
          <span className="font-bold text-slate-900">
            Grocery<span className="text-sky-600">Index</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/markets"
            className="px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg transition-colors"
          >
            Markets
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </nav>

        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
};
