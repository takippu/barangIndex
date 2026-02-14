"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/src/lib/api-client";

interface LandingScreenProps {
  readonly className?: string;
}

type PulsePayload = {
  region: { id: number | null; name: string };
  days: number;
  totals: {
    totalReports: number;
    verifiedReports: number;
    pendingReports: number;
    activeMarkets: number;
    activeContributors: number;
    lastReportedAt: string | null;
  };
};

const FEATURES = [
  {
    icon: "monitoring",
    title: "Price Transparency",
    description: "Real-time market data from verified community contributors. Track price movements across regions.",
    stat: "Live Data",
  },
  {
    icon: "verified",
    title: "Verified Reports",
    description: "Community-verified price reports ensure accuracy. Each submission is cross-checked by fellow shoppers.",
    stat: "Trust Score",
  },
  {
    icon: "savings",
    title: "Smart Savings",
    description: "Compare prices across markets and make informed decisions. Save money on your grocery bills.",
    stat: "Avg. 15%",
  },
  {
    icon: "emoji_events",
    title: "Civic Impact",
    description: "Contribute to public price data and earn recognition. Help fellow citizens make better choices.",
    stat: "Public Good",
  },
];

const STATS = [
  { label: "Active Markets", key: "activeMarkets" as const },
  { label: "Verified Reports", key: "verifiedReports" as const },
  { label: "Contributors", key: "activeContributors" as const },
  { label: "Price Points", key: "totalReports" as const },
];

export const LandingScreen: React.FC<LandingScreenProps> = ({ className = "" }) => {
  const [pulse, setPulse] = useState<PulsePayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiGet<PulsePayload>("/api/v1/community/pulse?days=30");
        setPulse(data);
      } catch {
        // Silently fail - stats are decorative
      } finally {
        setLoading(false);
      }
    };
    void loadStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className={`min-h-screen bg-[#f8fafc] ${className}`}>
      {/* Navigation - Soft UI */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f8fafc]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
                <span className="material-symbols-outlined text-xl">shopping_basket</span>
              </div>
              <span className="text-xl font-bold text-slate-800">
                Grocery<span className="text-sky-600">Index</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/markets"
                className="hidden md:inline-flex px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Explore Markets
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-sky-600/25 hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-600/30 transition-all"
              >
                Get Started
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Soft UI with depth */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Soft gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-cyan-50" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-600">Public Price Intelligence</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-6">
                Transparent{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600">
                  Grocery
                </span>{" "}
                Prices
              </h1>
              
              <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                A civic technology platform empowering consumers with real-time, 
                community-verified grocery price data. Make informed decisions, 
                save money, and contribute to public transparency.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sky-600 text-white font-semibold rounded-2xl shadow-xl shadow-sky-600/25 hover:bg-sky-700 hover:shadow-2xl hover:shadow-sky-600/30 transition-all hover:-translate-y-0.5"
                >
                  Start Contributing
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link
                  href="/markets"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 font-semibold rounded-2xl shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 border border-slate-100 transition-all hover:-translate-y-0.5"
                >
                  View Price Index
                  <span className="material-symbols-outlined">trending_up</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined text-emerald-500">verified</span>
                  <span className="text-sm font-medium text-slate-600">Community Verified</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined text-sky-500">public</span>
                  <span className="text-sm font-medium text-slate-600">Open Data</span>
                </div>
              </div>
            </div>

            {/* Hero Card - Soft UI Dashboard Preview */}
            <div className="relative">
              {/* Main card with soft shadow */}
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/60 border border-slate-100">
                {/* Card header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Market Pulse</p>
                    <p className="text-2xl font-bold text-slate-900">Community Overview</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-700">Live</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {STATS.map((stat) => (
                    <div
                      key={stat.key}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <p className="text-2xl font-bold text-slate-900 mb-1">
                        {loading ? "—" : formatNumber(pulse?.totals[stat.key] ?? 0)}
                      </p>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Chart placeholder */}
                <div className="p-6 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl border border-sky-100">
                  <div className="flex items-end justify-between h-32 gap-2">
                    {[65, 45, 80, 55, 70, 90, 60, 75, 85, 50].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-sky-500 to-cyan-400 rounded-t-lg opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-xs text-slate-500">
                    <span>Week 1</span>
                    <span>Week 5</span>
                    <span>Week 10</span>
                  </div>
                </div>
              </div>

              {/* Floating notification cards */}
              <div className="absolute -right-4 top-1/4 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-pulse" style={{ animationDuration: "4s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Report Verified</p>
                    <p className="text-xs text-slate-500">+15 reputation</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-4 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-pulse" style={{ animationDuration: "5s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600">trending_down</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Price Drop Alert</p>
                    <p className="text-xs text-slate-500">Eggs -8% at TTDI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar - Clean data display */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.key} className="text-center">
                <p className="text-4xl font-bold text-slate-900 mb-1">
                  {loading ? (
                    <span className="inline-block w-16 h-10 bg-slate-100 rounded-lg animate-pulse" />
                  ) : (
                    formatNumber(pulse?.totals[stat.key] ?? 0)
                  )}
                </p>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Soft cards */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-sky-600 uppercase tracking-wider mb-3">Platform Features</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Civic Tech Meets{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600">
                Financial Intelligence
              </span>
            </h2>
            <p className="text-lg text-slate-600">
              Built for transparency, powered by community, designed for impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, idx) => (
              <div
                key={feature.title}
                className="group p-8 bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
                    <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold text-sky-700 bg-sky-50 rounded-full border border-sky-100">
                    {feature.stat}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Process flow */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-sky-600 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Three Steps to Transparency
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Discover",
                description: "Browse real-time price data from markets across your region. Filter by item, location, or price range.",
                icon: "search",
              },
              {
                step: "02",
                title: "Contribute",
                description: "Submit prices you encounter while shopping. Snap a photo or enter manually - every report counts.",
                icon: "add_circle",
              },
              {
                step: "03",
                title: "Verify",
                description: "Community members cross-check reports. Verified data earns reputation and unlocks achievements.",
                icon: "verified",
              },
            ].map((item, idx) => (
              <div key={item.step} className="relative">
                <div className="p-8 bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-5xl font-bold text-slate-100">{item.step}</span>
                    <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sky-600">{item.icon}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sky-600 text-sm">arrow_forward</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section - Social proof */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Built for the Community,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                    By the Community
                  </span>
                </h2>
                <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                  GroceryIndex is a civic technology initiative. Our mission is to democratize 
                  price information and empower consumers with transparent, actionable data.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl">
                    <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                    <span className="text-sm font-medium text-white">Open Data</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl">
                    <span className="material-symbols-outlined text-sky-400">shield</span>
                    <span className="text-sm font-medium text-white">Privacy First</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl">
                    <span className="material-symbols-outlined text-amber-400">groups</span>
                    <span className="text-sm font-medium text-white">Community Driven</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "100%", label: "Free to Use" },
                  { value: "24/7", label: "Live Updates" },
                  { value: "0", label: "Hidden Fees" },
                  { value: "∞", label: "Impact Potential" },
                ].map((item) => (
                  <div key={item.label} className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                    <p className="text-3xl font-bold text-white mb-1">{item.value}</p>
                    <p className="text-sm text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-sky-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join the Price Transparency Movement
          </h2>
          <p className="text-lg text-sky-100 mb-10 max-w-2xl mx-auto">
            Start contributing today and help build a more transparent marketplace 
            for everyone. It&apos;s free, fast, and makes a real difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-sky-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Get Started Free
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link
              href="/markets"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sky-700 text-white font-bold rounded-2xl border border-sky-500 hover:bg-sky-800 transition-all"
            >
              Explore Data
              <span className="material-symbols-outlined">trending_up</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">shopping_basket</span>
                </div>
                <span className="text-xl font-bold text-white">
                  Grocery<span className="text-sky-400">Index</span>
                </span>
              </div>
              <p className="text-slate-400 max-w-sm">
                A civic technology platform for transparent grocery pricing. 
                Empowering consumers with real-time, community-verified data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="/markets" className="text-slate-400 hover:text-white transition-colors">Markets</Link></li>
                <li><Link href="/search" className="text-slate-400 hover:text-white transition-colors">Search</Link></li>
                <li><Link href="/price-index" className="text-slate-400 hover:text-white transition-colors">Price Index</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Account</h4>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-slate-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/profile" className="text-slate-400 hover:text-white transition-colors">Profile</Link></li>
                <li><Link href="/badges" className="text-slate-400 hover:text-white transition-colors">Achievements</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} GroceryIndex. A civic tech initiative.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-slate-500 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
