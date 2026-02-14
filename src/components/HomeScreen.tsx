"use client";

import React from 'react';
import Link from 'next/link';
import { homeData } from '../data/homeData';

interface HomeScreenProps {
    readonly className?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ className = '' }) => {
    return (
        <div className={`bg-[#f6f8f7]  font-display text-[#1a2e21]  antialiased min-h-screen pb-24 ${className}`}>
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative">

                {/* Header */}
                <header className="sticky top-0 z-20 bg-[#f6f8f7]/90  backdrop-blur-md px-4 pt-6 pb-2 border-b border-[#17cf5a]/5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{homeData.header.location.label}</h1>
                            <div className="flex items-center gap-1 cursor-pointer">
                                <span className="text-lg font-extrabold text-[#17cf5a]">{homeData.header.location.value}</span>
                                <span className="material-symbols-outlined text-[#17cf5a] text-xl">expand_more</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white  border border-[#17cf5a]/10 flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined text-gray-400">{homeData.header.profileIcon}</span>
                        </div>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-3 bg-white  border border-[#17cf5a]/10 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#17cf5a]/50 focus:border-[#17cf5a] placeholder-gray-400 outline-none shadow-sm transition-all"
                            placeholder={homeData.header.searchPlaceholder}
                            type="text"
                        />
                    </div>
                </header>

                {/* Market Pulse */}
                <section className="px-4 py-4">
                    <div className="bg-white  rounded-2xl p-5 border border-[#17cf5a]/10 shadow-sm relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-[#17cf5a]/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">{homeData.marketPulse.title}</h2>
                                <p className="text-2xl font-extrabold mt-1">{homeData.marketPulse.value}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-0.5 ${homeData.marketPulse.isUp ? 'text-[#17cf5a] bg-[#17cf5a]/10' : 'text-[#ef4444] bg-[#ef4444]/10'}`}>
                                <span className="material-symbols-outlined text-sm">{homeData.marketPulse.isUp ? 'trending_up' : 'trending_down'}</span>
                                {homeData.marketPulse.change}
                            </span>
                        </div>
                        {/* Simple SVG Chart */}
                        <div className="h-16 w-full relative mb-4">
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                                <defs>
                                    <linearGradient id="snapshotGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#17cf5a" stopOpacity="0.2"></stop>
                                        <stop offset="100%" stopColor="#17cf5a" stopOpacity="0"></stop>
                                    </linearGradient>
                                </defs>
                                <path d="M0,35 Q10,32 20,25 T40,28 T60,15 T80,18 T100,5" fill="url(#snapshotGradient)" stroke="none"></path>
                                <path d="M0,35 Q10,32 20,25 T40,28 T60,15 T80,18 T100,5" fill="none" stroke="#17cf5a" strokeLinecap="round" strokeWidth="2"></path>
                            </svg>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium text-gray-500 relative z-10">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-[#17cf5a] rounded-full"></span>
                                {homeData.marketPulse.status}
                            </span>
                            <span>{homeData.marketPulse.lastUpdated}</span>
                        </div>
                    </div>
                </section>

                {/* Top Movers */}
                <section className="mb-6">
                    <div className="px-4 flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Top Movers (24h)</h3>
                    </div>
                    <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
                        {homeData.topMovers.map((mover, index) => (
                            <Link href="/price-index" key={index} className="min-w-[140px] bg-white  p-3 rounded-xl border border-[#17cf5a]/5 flex flex-col justify-between">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50  flex items-center justify-center text-xl">{mover.icon}</div>
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${mover.isUp ? 'text-[#17cf5a] bg-[#17cf5a]/10' : 'text-[#ef4444] bg-[#ef4444]/10'}`}>{mover.change}</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500">{mover.name}</p>
                                    <p className="text-sm font-extrabold">{mover.price}<span className="text-[10px] font-normal text-gray-400">{mover.unit}</span></p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="px-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {homeData.activities.map((activity, index) => (
                            <Link href="/price-index" key={index} className="bg-white  rounded-xl p-4 border border-[#17cf5a]/5 block">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100  flex items-center justify-center overflow-hidden">
                                        <span className="material-symbols-outlined text-gray-400">person</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-bold">{activity.user}</p>
                                            <span className="text-[10px] font-medium text-gray-400">{activity.time}</span>
                                        </div>
                                        <p className="text-xs text-[#17cf5a] font-semibold flex items-center gap-1">
                                            {activity.isVerified && <span className="material-symbols-outlined text-xs">verified</span>}
                                            {activity.isVerified ? 'Verified Report' : 'Community Report'} • {activity.location}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-[#f6f8f7]  rounded-lg p-3 mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white  flex items-center justify-center text-xl shadow-sm">{activity.item.icon}</div>
                                        <div>
                                            <p className="text-sm font-bold">{activity.item.name}</p>
                                            <p className="text-xs text-gray-500">{activity.item.variant}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold">{activity.item.price}<span className="text-xs font-normal">{activity.item.unit}</span></p>
                                        <span className={`text-[10px] font-bold ${activity.item.isUp === true ? 'text-[#17cf5a]' : activity.item.isUp === false ? 'text-[#ef4444]' : 'text-gray-400'}`}>
                                            {activity.item.change}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-2 px-1">
                                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#17cf5a] transition-colors">
                                        <span className="material-symbols-outlined text-lg">thumb_up</span>
                                        <span className="text-xs font-bold">{activity.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#17cf5a] transition-colors">
                                        <span className="material-symbols-outlined text-lg">comment</span>
                                        <span className="text-xs font-bold">{activity.comments}</span>
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95  backdrop-blur-xl border-t border-[#17cf5a]/10 px-6 py-3 flex justify-between items-center z-30">
                    {homeData.navigation.map((item, index) => (
                        item.isFab ? (
                            <div key={index} className="relative -top-6">
                                <button className="w-14 h-14 bg-[#17cf5a] text-white rounded-full shadow-lg shadow-[#17cf5a]/40 flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
                                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                                </button>
                            </div>
                        ) : (
                            <a key={index} className={`flex flex-col items-center gap-1 ${item.isActive ? 'text-[#17cf5a]' : 'text-gray-400 hover:text-[#17cf5a]'} transition-colors`} href="#">
                                <span className={`material-symbols-outlined ${item.isActive ? 'fill-1' : ''}`}>{item.icon}</span>
                                <span className="text-[10px] font-bold">{item.label}</span>
                            </a>
                        )
                    ))}
                </nav>
            </div>
        </div>
    );
};
