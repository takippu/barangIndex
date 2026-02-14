"use client";

import React from 'react';
import Link from 'next/link';
import { priceIndexData } from '../data/priceIndexData';

interface PriceIndexScreenProps {
    readonly className?: string;
}

export const PriceIndexScreen: React.FC<PriceIndexScreenProps> = ({ className = '' }) => {
    return (
        <div className={`bg-[#f6f8f7]  px-2 py-1 rounded-lg text-[#1a2e21]  text-xs font-bold leading-none min-h-screen pb-24 ${className}`}>
            <div className="max-w-md mx-auto min-h-screen flex flex-col pb-20">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-[#f6f8f7]/80  backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-[#17cf5a]/10">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <div className="flex-1 px-3">
                        <h1 className="text-sm font-semibold text-[#17cf5a] uppercase tracking-wider">{priceIndexData.header.title}</h1>
                        <h2 className="text-lg font-extrabold leading-tight truncate">{priceIndexData.header.subtitle}</h2>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors">
                        <span className="material-symbols-outlined text-2xl">share</span>
                    </button>
                </header>

                {/* Price Overview */}
                <section className="px-4 pt-6 pb-2">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-3xl font-extrabold tracking-tight">{priceIndexData.overview.price}</div>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="bg-[#17cf5a]/10 px-2 py-0.5 rounded-full text-xs font-bold text-[#17cf5a] flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    {priceIndexData.overview.change}
                                </span>
                                <span className="text-xs text-gray-500  font-medium">{priceIndexData.overview.timeframe}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500  font-medium uppercase tracking-tighter">Market Interest</p>
                            <p className="text-sm font-bold">{priceIndexData.overview.tracks}</p>
                        </div>
                    </div>
                </section>

                {/* Area & Time Selector */}
                <section className="px-4 py-4 space-y-4">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        <div className="relative flex-1 min-w-[140px]">
                            <select className="w-full pl-10 pr-4 py-2 bg-white  border border-[#17cf5a]/20 rounded-lg text-sm font-semibold appearance-none focus:ring-[#17cf5a] focus:border-[#17cf5a]">
                                <option>Klang Valley</option>
                                <option>Penang</option>
                                <option>Johor Bahru</option>
                            </select>
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#17cf5a] text-xl">location_on</span>
                        </div>
                        <div className="flex bg-[#17cf5a]/5  p-1 rounded-lg shrink-0">
                            <button className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white  shadow-sm">7D</button>
                            <button className="px-3 py-1.5 text-xs font-bold rounded-md bg-white  text-[#17cf5a] shadow-sm">30D</button>
                            <button className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white ">90D</button>
                            <button className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white ">1Y</button>
                        </div>
                    </div>
                </section>

                {/* Chart Section */}
                <section className="px-4 py-2 relative h-56 w-full flex flex-col justify-end">
                    <div className="absolute inset-x-4 top-0 bottom-8 bg-gradient-to-b from-[#17cf5a]/15 to-transparent rounded-xl border-x border-t border-[#17cf5a]/5"></div>
                    <svg className="absolute inset-x-4 bottom-8 w-[calc(100%-32px)] h-40 overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 100">
                        <defs>
                            <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#17cf5a"></stop>
                                <stop offset="100%" stopColor="#17cf5a" stopOpacity="0.5"></stop>
                            </linearGradient>
                        </defs>
                        <path d="M0,80 Q50,75 80,60 T150,55 T220,40 T300,45 T400,20" fill="none" stroke="url(#lineGradient)" strokeLinecap="round" strokeWidth="3"></path>
                        <circle cx="220" cy="40" fill="#17cf5a" r="4"></circle>
                        <line stroke="#17cf5a" strokeDasharray="4" strokeOpacity="0.5" x1="220" x2="220" y1="40" y2="100"></line>
                    </svg>
                    <div className="absolute left-1/2 -translate-x-1/2 top-4 bg-[#112117]  text-white  px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl z-10 flex items-center gap-2">
                        <span>{priceIndexData.chart.date}:</span>
                        <span>{priceIndexData.chart.current}</span>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="px-4 py-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 px-1">Market Statistics</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {priceIndexData.stats.map((stat, index) => (
                            <div key={index} className="bg-white  p-4 rounded-xl border border-[#17cf5a]/5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                {stat.hasIndicator ? (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-[#17cf5a]"></span>
                                        <p className="text-base font-extrabold">{stat.value}</p>
                                    </div>
                                ) : (
                                    stat.isPrimary ? (
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-base font-extrabold text-[#17cf5a]">{stat.value}</p>
                                            {stat.isVerified && <span className="material-symbols-outlined text-[#17cf5a] text-sm">verified</span>}
                                        </div>
                                    ) : (
                                        <p className="text-base font-extrabold">{stat.value}</p>
                                    )
                                )}
                                <p className="text-[10px] font-medium text-gray-400">{stat.subtext}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Data Transparency */}
                <section className="mx-4 mb-6 bg-[#17cf5a]/5  p-5 rounded-2xl border border-[#17cf5a]/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#17cf5a]/20 flex items-center justify-center text-[#17cf5a]">
                            <span className="material-symbols-outlined">analytics</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold">Data Transparency</h4>
                            <p className="text-xs text-gray-500 font-medium">Based on local crowdsourced reports</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500">Verified Reports</span>
                            <span className="text-sm font-bold">{priceIndexData.transparency.verified}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500">Unique Reporters</span>
                            <span className="text-sm font-bold">{priceIndexData.transparency.reporters}</span>
                        </div>
                        <div className="pt-2">
                            <div className="h-1.5 w-full bg-[#17cf5a]/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#17cf5a] rounded-full w-[98%]"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Where to buy Button */}
                <section className="px-4 mb-6">
                    <Link href="/search" className="w-full bg-[#1a2e21] text-white py-4 rounded-xl shadow-lg shadow-[#1a2e21]/20 flex items-center justify-between px-6 hover:bg-gray-800 transition-colors group">
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-[#17cf5a] uppercase tracking-wider mb-0.5">Where to buy</span>
                            <span className="text-lg font-bold">Compare Prices</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-400">12 Stores</span>
                            <span className="material-symbols-outlined text-[#17cf5a] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </Link>
                </section>

                {/* Related Items */}
                <section className="mb-6">
                    <div className="px-4 flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Similar Indexes</h3>
                        <button className="text-[#17cf5a] text-xs font-bold">View All</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide">
                        {priceIndexData.related.map((item, index) => (
                            <div key={index} className="min-w-[160px] bg-white  p-4 rounded-xl border border-[#17cf5a]/5">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100  flex items-center justify-center overflow-hidden">
                                        <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
                                    </div>
                                    <span className={`text-[10px] font-bold ${item.isDown ? 'text-red-500' : 'text-[#17cf5a]'}`}>{item.change}</span>
                                </div>
                                <p className="text-xs font-bold truncate">{item.name}</p>
                                <p className="text-sm font-extrabold mt-0.5">{item.price}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
