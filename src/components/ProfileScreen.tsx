"use client";

import React from 'react';
import { profileData } from '../data/profileData';

interface ProfileScreenProps {
    readonly className?: string;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ className = '' }) => {
    return (
        <div className={`bg-[#f6f8f7]  font-display text-[#1a2e21]  antialiased min-h-screen pb-24 ${className}`}>
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative">

                {/* Header */}
                <header className="sticky top-0 z-20 bg-[#f6f8f7]/80  backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-[#17cf5a]/10">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <div className="flex-1 px-3 text-center">
                        <h1 className="text-lg font-extrabold leading-tight">My Reputation</h1>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors">
                        <span className="material-symbols-outlined text-2xl">settings</span>
                    </button>
                </header>

                {/* Profile Overview */}
                <section className="px-4 pt-6 pb-2 text-center">
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full bg-[#17cf5a]/20 flex items-center justify-center mx-auto overflow-hidden border-4 border-white  shadow-xl">
                            <img alt="Profile" className="w-full h-full object-cover" src={profileData.user.avatar} />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[#17cf5a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white ">
                            {profileData.user.level}
                        </div>
                    </div>
                    <h2 className="text-xl font-extrabold">{profileData.user.name}</h2>
                    <div className="flex items-center justify-center gap-1.5 mt-1 text-[#17cf5a]">
                        <span className="material-symbols-outlined text-lg fill-1">verified</span>
                        <span className="text-sm font-bold uppercase tracking-wide">{profileData.user.role}</span>
                    </div>
                </section>

                {/* Main Stats */}
                <section className="px-4 py-4">
                    <div className="grid grid-cols-2 gap-3">
                        {profileData.stats.map((stat, index) => (
                            <div key={index} className={`${stat.isDark ? 'bg-[#112117] text-white shadow-lg shadow-[#17cf5a]/10' : 'bg-[#17cf5a]/10  border border-[#17cf5a]/20'} p-4 rounded-xl text-center relative overflow-hidden`}>
                                <div className={`absolute top-0 right-0 p-2 ${stat.isDark ? 'opacity-20' : 'opacity-10'}`}>
                                    <span className="material-symbols-outlined text-4xl text-[#17cf5a]">{stat.icon}</span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-500  uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className="text-2xl font-extrabold text-[#17cf5a]">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Impact Stats */}
                <section className="px-4 py-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 px-1">Impact Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {profileData.impactStats.map((stat, index) => (
                            <div key={index} className="bg-white  p-4 rounded-xl border border-[#17cf5a]/5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                <div className="flex items-center gap-1.5">
                                    {stat.hasIndicator && <span className="w-2 h-2 rounded-full bg-[#17cf5a]"></span>}
                                    <p className={`text-base font-extrabold ${stat.isVerified ? 'text-[#17cf5a]' : ''}`}>{stat.value}</p>
                                    {stat.isVerified && <span className="material-symbols-outlined text-[#17cf5a] text-sm">verified</span>}
                                </div>
                                <p className="text-[10px] font-medium text-gray-400">{stat.subtext}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Badges */}
                <section className="px-4 py-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Badges Earned</h3>
                        <button className="text-[#17cf5a] text-xs font-bold">View All</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                        {profileData.badges.map((badge, index) => (
                            <div key={index} className={`min-w-[100px] flex flex-col items-center gap-2 ${badge.isLocked ? 'opacity-50 grayscale' : ''}`}>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm border-2 ${badge.isLocked
                                    ? 'bg-gray-100  border-gray-300'
                                    : badge.color === 'yellow'
                                        ? 'bg-gradient-to-br from-yellow-100 to-yellow-200   border-yellow-400'
                                        : badge.color === 'blue'
                                            ? 'bg-gradient-to-br from-blue-100 to-blue-200   border-blue-400'
                                            : 'bg-gradient-to-br from-purple-100 to-purple-200   border-purple-400'
                                    }`}>
                                    <span className={`material-symbols-outlined text-3xl ${badge.isLocked
                                        ? 'text-gray-400'
                                        : badge.color === 'yellow'
                                            ? 'text-yellow-600'
                                            : badge.color === 'blue'
                                                ? 'text-blue-600'
                                                : 'text-purple-600'
                                        }`}>{badge.icon}</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold">{badge.name}</p>
                                    <p className="text-[10px] text-gray-400">{badge.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="px-4 pb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 px-1">Recent Activity</h3>
                    <div className="space-y-3">
                        {profileData.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center gap-3 bg-white  p-3 rounded-xl border border-[#17cf5a]/5">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.iconBg} ${activity.iconColor}`}>
                                    <span className="material-symbols-outlined text-xl">{activity.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{activity.title}</p>
                                    <p className="text-xs text-gray-500">{activity.location}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-[#17cf5a]">{activity.points}</span>
                                    <p className="text-[10px] text-gray-400">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95  backdrop-blur-xl border-t border-[#17cf5a]/10 px-6 py-3 flex justify-between items-center z-30">
                    <a className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#17cf5a] transition-colors" href="#">
                        <span className="material-symbols-outlined">home</span>
                        <span className="text-[10px] font-bold">Home</span>
                    </a>
                    <a className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#17cf5a] transition-colors" href="#">
                        <span className="material-symbols-outlined">monitoring</span>
                        <span className="text-[10px] font-bold">Markets</span>
                    </a>
                    <div className="relative -top-6">
                        <button className="w-14 h-14 bg-[#17cf5a] text-white rounded-full shadow-lg shadow-[#17cf5a]/40 flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
                            <span className="material-symbols-outlined text-3xl">add</span>
                        </button>
                    </div>
                    <a className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#17cf5a] transition-colors" href="#">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="text-[10px] font-bold">Alerts</span>
                    </a>
                    <a className="flex flex-col items-center gap-1 text-[#17cf5a]" href="#">
                        <span className="material-symbols-outlined fill-1">person</span>
                        <span className="text-[10px] font-bold">Profile</span>
                    </a>
                </nav>
            </div>
        </div>
    );
};
