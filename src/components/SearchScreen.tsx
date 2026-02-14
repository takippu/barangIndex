"use client";

import React from 'react';
import Link from 'next/link';
import { searchData } from '../data/searchData';

interface SearchScreenProps {
    readonly className?: string;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ className = '' }) => {
    return (
        <div className={`bg-[#f6f8f7]  font-display text-[#1a2e21]  antialiased min-h-screen pb-24 ${className}`}>
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative">

                {/* Header */}
                <header className="sticky top-0 z-30 bg-[#f6f8f7]/90  backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-gray-200 ">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100  transition-colors">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <div className="flex-1 relative">
                        <input className="w-full pl-10 pr-4 py-2.5 bg-white  border border-gray-200  rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#17cf5a] focus:border-[#17cf5a] shadow-sm" type="text" defaultValue={searchData.header.searchPlaceholder} />
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#17cf5a]/10 text-[#17cf5a] hover:bg-[#17cf5a]/20 transition-colors">
                        <span className="material-symbols-outlined text-xl">tune</span>
                    </button>
                </header>

                {/* Stats */}
                <section className="px-4 py-4">
                    <div className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100  flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-bold text-gray-500  uppercase tracking-wider mb-1">{searchData.stats.nationalIndex.label}</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-extrabold tracking-tight">{searchData.stats.nationalIndex.price}</span>
                                <span className="text-xs font-semibold text-gray-400">{searchData.stats.nationalIndex.suffix}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-1 mb-1">
                                <span className={`bg-[#17cf5a]/10 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#17cf5a] flex items-center gap-0.5`}>
                                    <span className="material-symbols-outlined text-[12px]">{searchData.stats.nationalIndex.isUp ? 'trending_up' : 'trending_down'}</span>
                                    {searchData.stats.nationalIndex.change}
                                </span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium">{searchData.stats.nationalIndex.subtext}</div>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <section className="px-4 pb-2">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        {searchData.filters.map((filter, index) => (
                            <button key={index} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter.active ? 'bg-[#17cf5a] text-white shadow-lg shadow-[#17cf5a]/20' : 'bg-white  border border-gray-200  hover:bg-gray-50'}`}>
                                {filter.icon && <span className={`material-symbols-outlined text-base ${filter.color || ''}`}>{filter.icon}</span>}
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Results */}
                <main className="flex-1 px-4 py-2 space-y-3">
                    <div className="flex items-center justify-between px-1 py-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{searchData.header.resultCount}</span>
                        <span className="text-xs font-bold text-[#17cf5a] flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {searchData.header.location}
                        </span>
                    </div>

                    {searchData.results.map((result, index) => (
                        <Link href="/price-index" key={index} className="bg-white  rounded-xl p-4 shadow-sm border border-gray-100  relative overflow-hidden group block">
                            {result.isBestPrice && <div className="absolute top-0 right-0 bg-[#17cf5a] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">BEST PRICE</div>}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gray-50  flex items-center justify-center p-2 border border-gray-100 ">
                                        <span className={`material-symbols-outlined text-2xl ${result.iconColor}`}>{result.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm leading-tight text-gray-900 ">{result.name}</h3>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                            <span className="material-symbols-outlined text-[14px]">distance</span>
                                            {result.distance} • {result.area}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1.5">
                                            {result.isVerified ? (
                                                <span className="text-[10px] font-bold text-blue-500 bg-blue-50  px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                    <span className="material-symbols-outlined text-[10px]">verified</span> Verified
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-medium text-gray-400 bg-gray-100  px-1.5 py-0.5 rounded flex items-center gap-0.5">Unverified</span>
                                            )}
                                            <span className="text-[10px] text-gray-400">{result.updated}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-lg font-extrabold ${result.isBestPrice ? 'text-[#17cf5a]' : ''}`}>{result.price}</div>
                                    {result.oldPrice && <div className="text-[10px] font-bold text-gray-400 line-through">{result.oldPrice}</div>}
                                    {result.discount && (
                                        <div className="flex justify-end mt-1">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${result.discountColor || 'text-red-500 bg-red-50'}`}>
                                                {result.discount}
                                            </span>
                                        </div>
                                    )}
                                    {result.change && (
                                        <div className="flex justify-end mt-1">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${result.isPriceUp ? 'text-red-500 bg-red-50' : 'text-green-500 bg-green-50'}`}>
                                                <span className="material-symbols-outlined text-[10px]">{result.isPriceUp ? 'trending_up' : 'trending_down'}</span>
                                                {result.change}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}

                    <div className="py-4 text-center">
                        <button className="text-xs font-bold text-[#17cf5a] uppercase tracking-wider flex items-center justify-center gap-1">
                            Load More Results
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                    </div>
                </main>
            </div >
        </div >
    );
};
