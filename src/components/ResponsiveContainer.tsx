"use client";

import React from "react";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  showNav?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = "",
  showNav = true 
}) => {
  return (
    <div className={`min-h-screen bg-slate-50 ${className}`}>
      {/* Desktop Header - Only visible on large screens */}
      <header className="hidden lg:block sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-base">shopping_basket</span>
            </div>
            <span className="font-bold text-slate-900">
              Grocery<span className="text-emerald-600">Index</span>
            </span>
          </a>
          <nav className="flex items-center gap-1">
            <a href="/home" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Home</a>
            <a href="/markets" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Markets</a>
            <a href="/search" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Search</a>
            <a href="/submit" className="px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Submit Price</a>
            <a href="/alerts" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Alerts</a>
            <a href="/profile" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Profile</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:py-8">
        <div className="max-w-md mx-auto lg:max-w-7xl lg:px-6">
          <div className="lg:bg-white lg:rounded-3xl lg:shadow-xl lg:shadow-slate-200/50 lg:border lg:border-slate-100 lg:min-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
