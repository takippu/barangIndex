"use client";

import React from 'react';
import { submitData } from '../data/submitData';

interface SubmitScreenProps {
    readonly className?: string;
}

export const SubmitScreen: React.FC<SubmitScreenProps> = ({ className = '' }) => {
    return (
        <div className={`bg-[#f6f8f7]  font-display text-[#1a2e21]  antialiased min-h-screen pb-24 ${className}`}>
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative">

                {/* Header */}
                <header className="sticky top-0 z-20 bg-[#f6f8f7]/80  backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-[#17cf5a]/10">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <div className="flex-1 px-3 text-center">
                        <h1 className="text-sm font-semibold text-[#17cf5a] uppercase tracking-wider">{submitData.header.title}</h1>
                        <h2 className="text-lg font-extrabold leading-tight truncate">{submitData.header.subtitle}</h2>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors opacity-0 pointer-events-none">
                        <span className="material-symbols-outlined text-2xl">share</span>
                    </button>
                </header>

                {/* Item Info */}
                <section className="px-6 pt-6 pb-2 text-center">
                    <div className="inline-flex items-center gap-2 bg-white  px-4 py-2 rounded-full border border-[#17cf5a]/10 mb-4 shadow-sm">
                        <div className="w-6 h-6 rounded bg-[#17cf5a]/20 flex items-center justify-center text-[#17cf5a]">
                            <span className="material-symbols-outlined text-base">{submitData.item.icon}</span>
                        </div>
                        <span className="text-sm font-bold">{submitData.item.name}</span>
                    </div>
                </section>

                {/* Price Input */}
                <section className="px-6 flex flex-col items-center justify-center py-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2" htmlFor="price-input">Current Price (RM)</label>
                    <div className="relative w-full max-w-[280px]">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-300 ">RM</span>
                        <input autoFocus className="w-full bg-transparent border-0 border-b-2 border-[#17cf5a]/30 focus:border-[#17cf5a] text-center text-6xl font-extrabold text-[#17cf5a] placeholder-[#17cf5a]/30 px-0 py-4 focus:outline-none focus:ring-0" id="price-input" placeholder="0.00" type="number" />
                    </div>
                    <p className="mt-3 text-xs text-gray-500 font-medium">Last report: {submitData.item.lastReport}</p>
                </section>

                {/* Form Fields */}
                <section className="px-4 py-6 space-y-5">
                    {/* Location */}
                    <div className="bg-white  p-4 rounded-xl border border-[#17cf5a]/10 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Location</label>
                            {submitData.location.isAutoDetected && (
                                <span className="bg-[#17cf5a]/10 text-[#17cf5a] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px]">my_location</span>
                                    Auto-detected
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50  flex items-center justify-center text-blue-500 shrink-0">
                                <span className="material-symbols-outlined">storefront</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm">{submitData.location.name}</p>
                                <p className="text-xs text-gray-500">{submitData.location.address}</p>
                            </div>
                            <button className="text-xs font-bold text-[#17cf5a] underline">Change</button>
                        </div>
                    </div>

                    {/* Grade Selector */}
                    <div className="space-y-3">
                        <label className="px-1 text-xs font-bold uppercase tracking-widest text-gray-400">Confirm Grade</label>
                        <div className="grid grid-cols-3 gap-2">
                            {submitData.grades.map((grade, index) => (
                                <button key={index} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${grade.active ? 'bg-[#17cf5a] text-white border-[#17cf5a] shadow-lg shadow-[#17cf5a]/20' : 'bg-white  hover:bg-gray-50  text-gray-600  border-gray-200'}`}>
                                    <span className="text-sm font-bold">{grade.name}</span>
                                    <span className={`text-[10px] ${grade.active ? 'opacity-80' : 'opacity-60'}`}>{grade.details}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stock Status */}
                    <div className="space-y-3">
                        <label className="px-1 text-xs font-bold uppercase tracking-widest text-gray-400">Stock Status</label>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                            {submitData.stock.map((status, index) => (
                                <label key={index} className="cursor-pointer relative group flex-shrink-0">
                                    <input className="peer sr-only" name="stock" type="radio" defaultChecked={status.active} />
                                    <div className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${status.color === 'primary'
                                        ? 'bg-white  peer-checked:bg-[#17cf5a]/10 peer-checked:border-[#17cf5a] peer-checked:text-[#17cf5a] border-gray-200'
                                        : status.color === 'yellow'
                                            ? 'bg-white  peer-checked:bg-yellow-500/10 peer-checked:border-yellow-500 peer-checked:text-yellow-600 border-gray-200'
                                            : 'bg-white  peer-checked:bg-red-500/10 peer-checked:border-red-500 peer-checked:text-red-500 border-gray-200'
                                        }`}>
                                        <span className="material-symbols-outlined text-sm">{status.icon}</span>
                                        {status.name}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer Impact */}
                <section className="mx-4 mt-auto mb-6 bg-[#17cf5a]/5  p-5 rounded-2xl border border-[#17cf5a]/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#17cf5a]/20 flex items-center justify-center text-[#17cf5a] shrink-0">
                            <span className="material-symbols-outlined">analytics</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold">Your Impact</h4>
                            <p className="text-xs text-gray-500 font-medium">Helping 12k+ users track fair prices</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500">Community Confidence</span>
                            <div className="flex items-center gap-1 text-[#17cf5a]">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                <span className="text-sm font-bold">98% Reliable</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500">Reports Today</span>
                            <span className="text-sm font-bold">+128</span>
                        </div>
                        <button className="w-full mt-2 bg-[#17cf5a] hover:bg-[#17cf5a]/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#17cf5a]/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <span>Submit Report</span>
                            <span className="material-symbols-outlined text-lg">send</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};
