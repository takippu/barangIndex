"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { apiGet } from "@/src/lib/api-client";
import { getItemIcon } from "@/src/lib/item-icons";

interface LandingScreenProps {
  readonly className?: string;
  readonly showOnboardingLink?: boolean;
  readonly user?: {
    name: string | null;
    email: string;
    image: string | null | undefined;
  } | null;
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
    color: "from-emerald-500 to-emerald-600",
    bgGlow: "bg-emerald-500/20",
  },
  {
    icon: "verified",
    title: "Verified Reports",
    description: "Community-verified price reports ensure accuracy. Each submission is cross-checked by fellow shoppers.",
    stat: "Trust Score",
    color: "from-blue-500 to-blue-600",
    bgGlow: "bg-blue-500/20",
  },
  {
    icon: "savings",
    title: "Smart Savings",
    description: "Compare prices across markets and make informed decisions. Save money on your grocery bills.",
    stat: "Avg. 15%",
    color: "from-amber-500 to-amber-600",
    bgGlow: "bg-amber-500/20",
  },
  {
    icon: "emoji_events",
    title: "Civic Impact",
    description: "Contribute to public price data and earn recognition. Help fellow citizens make better choices.",
    stat: "Public Good",
    color: "from-rose-500 to-rose-600",
    bgGlow: "bg-rose-500/20",
  },
];

const STATS = [
  { label: "Active Markets", key: "activeMarkets" as const },
  { label: "Total Reports", key: "totalReports" as const },
  { label: "Contributors", key: "activeContributors" as const },
  { label: "Verified Reports", key: "verifiedReports" as const },
];

// Custom hook for intersection observer animations
const useInView = (options = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setIsInView(true);
        setHasAnimated(true);
      }
    }, { threshold: 0.2, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, options]);

  return { ref, isInView };
};

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const { ref, isInView } = useInView();

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endValue = value;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * endValue);

      countRef.current = current;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return <span ref={ref}>{formatNumber(count)}</span>;
};

// Fade In Up Animation Wrapper
const FadeInUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = ""
}) => {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Scale In Animation Wrapper
const ScaleIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = ""
}) => {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'scale(1)' : 'scale(0.9)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Stagger Container
const StaggerContainer: React.FC<{ children: React.ReactNode; className?: string; staggerDelay?: number }> = ({
  children,
  className = "",
  staggerDelay = 100
}) => {
  const { ref, isInView } = useInView();

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className="transition-all duration-700"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(40px)',
            transitionDelay: `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Full Screen Stacking Cards Component
const StackingFeatures: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const cardHeight = window.innerHeight;

      const scrollProgress = -rect.top;
      const newIndex = Math.min(
        FEATURES.length - 1,
        Math.max(0, Math.floor(scrollProgress / cardHeight))
      );

      setActiveIndex(newIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative" style={{ height: `${FEATURES.length * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-700 ${FEATURES[activeIndex].bgGlow}`} />
        </div>

        {/* Progress indicators */}
        <div className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          {FEATURES.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${idx === activeIndex
                  ? "h-8 bg-emerald-500"
                  : idx < activeIndex
                    ? "bg-emerald-500/50"
                    : "bg-slate-300"
                }`}
            />
          ))}
        </div>

        {/* Card counter */}
        <div className="absolute top-8 right-8 z-20">
          <span className="text-6xl sm:text-8xl font-black text-slate-100">
            0{activeIndex + 1}
          </span>
        </div>

        {/* Cards stack */}
        <div className="relative w-full max-w-2xl mx-auto px-6">
          {FEATURES.map((feature, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;
            const isFuture = index > activeIndex;

            let transform = "";
            let opacity = 1;
            let zIndex = FEATURES.length - index;

            if (isPast) {
              transform = "translateY(-120%) scale(0.9)";
              opacity = 0;
              zIndex = 0;
            } else if (isFuture) {
              transform = `translateY(${(index - activeIndex) * 30}px) scale(${1 - (index - activeIndex) * 0.05})`;
              opacity = 1 - (index - activeIndex) * 0.3;
            } else {
              transform = "translateY(0) scale(1)";
              opacity = 1;
            }

            return (
              <div
                key={feature.title}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2"
                style={{
                  transform,
                  opacity,
                  zIndex,
                  transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <div className="bg-white rounded-3xl sm:rounded-[2rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/60 border border-slate-100">
                  {/* Icon and stat row */}
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-xl`}>
                      <span className="material-symbols-outlined text-3xl sm:text-4xl">{feature.icon}</span>
                    </div>
                    <span className={`px-4 py-2 text-sm font-bold text-white bg-gradient-to-r ${feature.color} rounded-full shadow-lg`}>
                      {feature.stat}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative element */}
                  <div className={`mt-8 h-1 w-24 rounded-full bg-gradient-to-r ${feature.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 animate-bounce">
          <span className="text-xs font-medium uppercase tracking-wider">
            {activeIndex < FEATURES.length - 1 ? "Scroll to explore" : "Keep scrolling"}
          </span>
          <span className="material-symbols-outlined">expand_more</span>
        </div>
      </div>
    </div>
  );
};

// Pill Navbar Component
const PillNavbar: React.FC<{ user: any; showOnboardingLink: boolean; bannerDismissed: boolean; setBannerDismissed: (v: boolean) => void }> = ({
  user,
  showOnboardingLink,
  bannerDismissed,
  setBannerDismissed
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Banner */}
      {showOnboardingLink && !bannerDismissed && (
        <div className={`fixed left-0 right-0 z-40 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 transition-all duration-500 ${isScrolled ? 'top-20' : 'top-16 sm:top-20'}`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="material-symbols-outlined text-lg sm:text-xl flex-shrink-0">waving_hand</span>
              <span className="text-xs sm:text-sm font-medium">Welcome! Take a quick tour to learn how GroceryIndex works.</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  document.cookie = "grocery_index_visited=true; path=/; max-age=31536000";
                  setBannerDismissed(true);
                }}
                className="text-xs sm:text-sm text-emerald-100 hover:text-white transition-colors px-2 py-1"
              >
                Dismiss
              </button>
              <Link
                href="/onboarding"
                className="px-3 sm:px-4 py-1.5 bg-white text-emerald-600 text-xs sm:text-sm font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
              >
                Take Tour
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-3' : 'py-0'}`}>
        <div className={`mx-auto transition-all duration-500 ${isScrolled ? 'max-w-3xl px-4' : 'max-w-7xl'}`}>
          <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled
              ? 'h-14 px-6 bg-white/90 backdrop-blur-xl rounded-full shadow-xl shadow-slate-200/50 border border-slate-100/50'
              : 'h-16 sm:h-20 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]/80 backdrop-blur-xl border-b border-slate-100'
            }`}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className={`rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-300 ${isScrolled
                  ? 'w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25'
                  : 'w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25'
                }`}>
                <span className={`material-symbols-outlined transition-all ${isScrolled ? 'text-base' : 'text-lg sm:text-xl'}`}>shopping_basket</span>
              </div>
              <span className={`font-bold text-slate-800 transition-all ${isScrolled ? 'text-base' : 'text-lg sm:text-xl'}`}>
                Grocery<span className="text-emerald-600">Index</span>
              </span>
            </Link>

            {/* Nav Items */}
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <Link
                  href="/home"
                  className={`flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-700 transition-all ${isScrolled ? 'px-4 py-2' : 'px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-xl'
                    }`}
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  <span className={isScrolled ? 'hidden sm:inline' : ''}>Back to Home</span>
                </Link>
              ) : (
                <>
                  {!isScrolled && (
                    <Link
                      href="/markets"
                      className="hidden sm:inline-flex px-4 sm:px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Explore Markets
                    </Link>
                  )}
                  <Link
                    href="/login"
                    className={`bg-white text-slate-700 text-sm font-semibold border border-slate-200 hover:shadow-md transition-all ${isScrolled
                        ? 'px-4 py-2 rounded-full'
                        : 'px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-sm'
                      }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    className={`bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all ${isScrolled
                        ? 'px-4 py-2 rounded-full shadow-lg shadow-emerald-600/25'
                        : 'px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-xl'
                      }`}
                  >
                    <span className={isScrolled ? 'hidden sm:inline' : ''}>Get Started</span>
                    <span className={isScrolled ? 'sm:hidden' : 'hidden'}>Start</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export const LandingScreen: React.FC<LandingScreenProps> = ({ className = "", showOnboardingLink = false, user }) => {
  const [pulse, setPulse] = useState<PulsePayload | null>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    // Trigger hero animations on mount
    setTimeout(() => setHeroLoaded(true), 100);

    const loadStats = async () => {
      try {
        const [pulseData, feedResponse, itemsData] = await Promise.all([
          apiGet<PulsePayload>(`/api/v1/community/pulse?days=0&_t=${Date.now()}`),
          apiGet<{ data: any[] }>("/api/v1/price-reports/feed?limit=20"),
          apiGet<any[]>("/api/v1/items?limit=100")
        ]);
        console.log("Pulse data:", pulseData);
        setPulse(pulseData);
        setFeed(feedResponse.data);
        setItems(itemsData);
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

  const topMovers = React.useMemo(() => {
    if (!feed.length || !items.length) return [];

    return items.slice(0, 10).map((item) => {
      const itemReports = feed
        .filter((entry) => entry.itemId === item.id)
        .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

      if (itemReports.length === 0) return null;

      const latestReport = itemReports[0];
      const previousReport = itemReports[1];

      const latestPrice = Number.parseFloat(latestReport.price);
      const previousPrice = previousReport ? Number.parseFloat(previousReport.price) : latestPrice;

      const trendPct = previousReport
        ? ((latestPrice - previousPrice) / previousPrice) * 100
        : (Math.random() * 10 - 5);

      const trend = trendPct > 0 ? 'up' : trendPct < 0 ? 'down' : 'neutral';

      return {
        id: item.id,
        name: item.name,
        icon: getItemIcon(item.name, item.category),
        trendPct: Math.abs(trendPct),
        trend,
      };
    }).filter(Boolean).sort((a, b) => (b?.trendPct || 0) - (a?.trendPct || 0));
  }, [feed, items]);

  return (
    <div className={`min-h-screen bg-[#f8fafc] ${className}`}>
      {/* Pill Navbar */}
      <PillNavbar
        user={user}
        showOnboardingLink={showOnboardingLink}
        bannerDismissed={bannerDismissed}
        setBannerDismissed={setBannerDismissed}
      />

      {/* Hero Section - Centered with scroll animations */}
      <section className={`relative overflow-hidden ${showOnboardingLink && !bannerDismissed ? 'pt-36 sm:pt-48' : 'pt-28 sm:pt-36'}`}>
        {/* Soft gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-100" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-emerald-100/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-12 sm:pb-16">
          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-4 sm:mb-6 transition-all duration-700"
            style={{
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            Transparent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500">
              Grocery
            </span>{" "}
            Prices
          </h1>

          <p
            className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0 transition-all duration-700 delay-100"
            style={{
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            A civic technology platform empowering consumers with real-time,
            community-verified grocery price data.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0 transition-all duration-700 delay-200"
            style={{
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-600 text-white font-semibold rounded-xl sm:rounded-2xl shadow-xl shadow-emerald-600/25 hover:bg-emerald-700 transition-all hover:-translate-y-0.5 hover:scale-105"
            >
              Start Contributing
              <span className="material-symbols-outlined text-lg sm:text-xl">arrow_forward</span>
            </Link>
            <Link
              href="/markets"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-slate-700 font-semibold rounded-xl sm:rounded-2xl shadow-lg shadow-slate-200/50 hover:shadow-xl border border-slate-100 transition-all hover:-translate-y-0.5 hover:scale-105"
            >
              Browse Markets
              <span className="material-symbols-outlined text-lg sm:text-xl">trending_up</span>
            </Link>
          </div>

          {/* Trust indicators - Below CTA buttons */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 mt-8 sm:mt-10 text-xs sm:text-sm text-slate-500 transition-all duration-700 delay-300"
            style={{
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Public Price Intelligence
            </span>
            <span className="mx-2 text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-500 text-sm">smartphone</span>
              Optimized for mobile
            </span>
            <span className="mx-2 text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-500 text-sm">verified</span>
              Community Verified
            </span>
            <span className="mx-2 text-slate-300 hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-start mt-1 sm:mt-0">
              <span className="material-symbols-outlined text-emerald-500 text-sm">public</span>
              Open Data
            </span>
          </div>
        </div>

        {/* Browser Mockup with Real Screenshot */}
        <FadeInUp delay={400}>
          <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-emerald-200/20 rounded-full blur-[80px]" />

            {/* Browser Window Frame */}
            <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl shadow-slate-300/50 overflow-hidden border border-slate-200">
              {/* Browser Toolbar */}
              <div className="bg-slate-100 border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-4">
                {/* Window Controls */}
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400" />
                </div>

                {/* Address Bar */}
                <div className="flex-1 bg-white rounded-md sm:rounded-lg px-3 py-1 sm:py-1.5 flex items-center gap-2 border border-slate-200">
                  <span className="material-symbols-outlined text-slate-400 text-sm">lock</span>
                  <span className="text-xs sm:text-sm text-slate-500 truncate">grocery.thaqifrosdi.my/home</span>
                </div>

                {/* Browser Actions */}
                <div className="hidden sm:flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-lg">refresh</span>
                  <span className="material-symbols-outlined text-slate-400 text-lg">more_vert</span>
                </div>
              </div>

              {/* Screenshot Content */}
              <div className="relative bg-slate-50">
                <img
                  src="/landing.jpg"
                  alt="GroceryIndex App Screenshot"
                  className="w-full h-auto object-cover"
                />

                {/* Subtle gradient overlay at bottom for blending */}
                <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-white/50 to-transparent" />
              </div>
            </div>

            {/* Floating UI Elements around the browser */}
            {/* Notification Badge */}
            <div className="absolute -top-2 -right-2 sm:-right-4 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 p-2 sm:p-3 transform rotate-3 animate-pulse" style={{ animationDuration: '4s' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-sm sm:text-base">notifications</span>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-900">New Report</p>
                  <p className="text-[8px] sm:text-[10px] text-slate-500">Just now</p>
                </div>
              </div>
            </div>

            {/* Stats Badge */}
            <div className="absolute -bottom-3 -left-2 sm:-left-6 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 p-2 sm:p-3 transform -rotate-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-lg sm:text-xl">trending_up</span>
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-500">Active Users</p>
                  <p className="text-sm sm:text-base font-bold text-slate-900">1,247</p>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* Stats Bar with counter animation */}
      <section className="py-8 sm:py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {STATS.map((stat, index) => (
              <ScaleIn key={stat.key} delay={index * 100}>
                <div className="text-center">
                  <p className="text-2xl sm:text-4xl font-bold text-slate-900 mb-0.5 sm:mb-1">
                    {loading ? (
                      <span className="inline-block w-12 sm:w-16 h-8 sm:h-10 bg-slate-100 rounded-lg animate-pulse" />
                    ) : (
                      <AnimatedCounter value={pulse?.totals[stat.key] ?? 0} duration={2000} />
                    )}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">{stat.label}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Full Screen Stacking Cards */}
      <section className="relative">
        {/* Section Header */}
        <div className="py-12 sm:py-16 text-center">
          <FadeInUp>
            <p className="text-xs sm:text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2 sm:mb-3">Platform Features</p>
          </FadeInUp>
          <FadeInUp delay={100}>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Civic Tech Meets{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500">
                Financial Intelligence
              </span>
            </h2>
          </FadeInUp>
          <FadeInUp delay={200}>
            <p className="text-sm sm:text-lg text-slate-600 px-2 sm:px-0 max-w-2xl mx-auto">
              Built for transparency, powered by community, designed for impact.
            </p>
          </FadeInUp>
        </div>

        <StackingFeatures />
      </section>

      {/* How It Works with stagger animations */}
      <section className="py-12 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-16">
            <FadeInUp>
              <p className="text-xs sm:text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2 sm:mb-3">How It Works</p>
            </FadeInUp>
            <FadeInUp delay={100}>
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
                Three Steps to Transparency
              </h2>
            </FadeInUp>
          </div>

          <StaggerContainer className="grid sm:grid-cols-3 gap-4 sm:gap-8" staggerDelay={150}>
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
              <div key={item.step} className="relative group">
                <div className="p-5 sm:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg shadow-slate-200/50 border border-slate-100 h-full transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <span className="text-4xl sm:text-5xl font-bold text-slate-100 group-hover:text-emerald-100 transition-colors">{item.step}</span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <span className="material-symbols-outlined text-emerald-600 text-lg sm:text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{item.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
                      <span className="material-symbols-outlined text-emerald-600 text-sm">arrow_forward</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Trust Section with scroll animations */}
      <section className="py-12 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-12 lg:p-16">
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div>
                  <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
                    Built for the Community,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">
                      By the Community
                    </span>
                  </h2>
                  <p className="text-base sm:text-lg text-slate-300 mb-6 sm:mb-8 leading-relaxed">
                    GroceryIndex is a civic technology initiative. Our mission is to democratize
                    price information and empower consumers with transparent, actionable data.
                  </p>
                  <StaggerContainer className="flex flex-wrap gap-2 sm:gap-4" staggerDelay={100}>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 rounded-lg sm:rounded-xl hover:bg-white/20 transition-colors cursor-default">
                      <span className="material-symbols-outlined text-emerald-400 text-lg sm:text-xl">check_circle</span>
                      <span className="text-xs sm:text-sm font-medium text-white">Open Data</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 rounded-lg sm:rounded-xl hover:bg-white/20 transition-colors cursor-default">
                      <span className="material-symbols-outlined text-emerald-400 text-lg sm:text-xl">shield</span>
                      <span className="text-xs sm:text-sm font-medium text-white">Privacy First</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 rounded-lg sm:rounded-xl hover:bg-white/20 transition-colors cursor-default">
                      <span className="material-symbols-outlined text-amber-400 text-lg sm:text-xl">groups</span>
                      <span className="text-xs sm:text-sm font-medium text-white">Community Driven</span>
                    </div>
                  </StaggerContainer>
                </div>
                <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-4" staggerDelay={100}>
                  {[
                    { value: "100%", label: "Free to Use" },
                    { value: "24/7", label: "Live Updates" },
                    { value: "0", label: "Hidden Fees" },
                    { value: "∞", label: "Impact Potential" },
                  ].map((item) => (
                    <div key={item.label} className="p-4 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                      <p className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1 group-hover:scale-110 transition-transform origin-left">{item.value}</p>
                      <p className="text-xs sm:text-sm text-slate-400">{item.label}</p>
                    </div>
                  ))}
                </StaggerContainer>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* CTA Section with animation */}
      <section className="py-12 sm:py-24 bg-emerald-600 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
              Join the Price Transparency Movement
            </h2>
          </FadeInUp>
          <FadeInUp delay={100}>
            <p className="text-base sm:text-lg text-emerald-100 mb-6 sm:mb-10 max-w-2xl mx-auto">
              Start contributing today and help build a more transparent marketplace
              for everyone. It&apos;s free, fast, and makes a real difference.
            </p>
          </FadeInUp>
          <FadeInUp delay={200}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-emerald-600 font-bold rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Get Started Free
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/markets"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-700 text-white font-bold rounded-xl sm:rounded-2xl border border-emerald-500 hover:bg-emerald-800 hover:scale-105 transition-all duration-300"
              >
                Explore Data
                <span className="material-symbols-outlined">trending_up</span>
              </Link>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Footer with stagger animation */}
      <footer className="py-10 sm:py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 mb-8 sm:mb-12" staggerDelay={100}>
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 group cursor-pointer">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-base sm:text-lg">shopping_basket</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-white">
                  Grocery<span className="text-emerald-400">Index</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm sm:text-base max-w-sm">
                A civic technology platform for transparent grocery pricing.
                Empowering consumers with real-time, community-verified data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Platform</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="/markets" className="text-slate-400 hover:text-white transition-colors text-sm sm:text-base hover:translate-x-1 inline-block">Markets</Link></li>
                <li><Link href="/search" className="text-slate-400 hover:text-white transition-colors text-sm sm:text-base hover:translate-x-1 inline-block">Search</Link></li>
                <li><Link href="/price-index" className="text-slate-400 hover:text-white transition-colors text-sm sm:text-base hover:translate-x-1 inline-block">Price Index</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Account</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="/login" className="text-slate-400 hover:text-white transition-colors text-sm sm:text-base hover:translate-x-1 inline-block">Sign In</Link></li>
                <li><Link href="/profile" className="text-slate-400 hover:text-white transition-colors text-sm sm:text-base hover:translate-x-1 inline-block">Profile</Link></li>
                <li><Link href="/badges" className="text-slate-400 hover:text-white transition-colors text-sm sm:text-base hover:translate-x-1 inline-block">Achievements</Link></li>
              </ul>
            </div>
          </StaggerContainer>
          <div className="pt-6 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-slate-500 text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} GroceryIndex. A civic tech initiative.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
