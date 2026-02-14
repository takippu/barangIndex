"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingSlides } from '../data/onboardingData';

interface OnboardingScreenProps {
    readonly className?: string;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ className = '' }) => {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);

    const markOnboardingComplete = async () => {
        try {
            // Try to mark onboarding as complete in the backend (for logged-in users)
            await fetch('/api/v1/onboarding/complete', {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // Silently fail - cookie fallback will handle non-logged in users
        }
    };

    const handleComplete = async () => {
        if (isCompleting) return;
        setIsCompleting(true);

        // Set cookie to expire in 1 year (for non-logged in visitors)
        document.cookie = "grocery_index_visited=true; path=/; max-age=31536000";

        // Mark onboarding as complete in database (for logged-in users)
        await markOnboardingComplete();

        // Force a hard navigation to ensure the server component sees the new cookie
        window.location.href = '/';
    };

    const handleNext = () => {
        if (currentSlide < onboardingSlides.length - 1) {
            setCurrentSlide(curr => curr + 1);
        } else {
            handleComplete();
        }
    };

    const slide = onboardingSlides[currentSlide];

    return (
        <div className={`bg-[#f8fafc] font-display text-slate-800 antialiased flex flex-col justify-between min-h-screen ${className}`}>
            <div className="max-w-md mx-auto w-full min-h-screen flex flex-col relative overflow-hidden lg:max-w-7xl lg:px-8">
                <div className="absolute top-0 right-0 p-6 z-20">
                    <button onClick={handleComplete} className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">Skip</button>
                </div>

                {/* Background Blurs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-emerald-100/50 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-green-100/30 rounded-full blur-[100px]"></div>

                {/* Card Section */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8 lg:flex-row lg:gap-16 lg:items-center lg:justify-center">
                    {/* Text Content - Desktop Left Side */}
                    <div className="hidden lg:block text-left max-w-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                                <span className="material-symbols-outlined text-2xl fill-1">monitoring</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-xl leading-tight text-slate-900">{slide.header.title}</h3>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{slide.header.subtitle}</p>
                            </div>
                        </div>
                        <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                            {slide.content.title} <span className="text-emerald-600">{slide.content.titleHighlight}</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                            {slide.content.description}
                        </p>
                    </div>

                    <div className="relative w-full max-w-[340px] lg:max-w-[420px] aspect-[4/5] mb-12 lg:mb-0">
                        {/* Stacked Cards Effect */}
                        <div className="absolute inset-0 bg-white/50 rounded-3xl transform rotate-6 scale-90 translate-y-4 shadow-sm border border-emerald-100 z-0"></div>
                        <div className="absolute inset-0 bg-white/80 rounded-3xl transform -rotate-3 scale-95 translate-y-2 shadow-md border border-emerald-100 z-0"></div>

                        {/* Main Card */}
                        <div className="absolute inset-0 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden flex flex-col z-10 transition-all duration-500">
                            {/* Card Header */}
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                                        <span className="material-symbols-outlined fill-1">monitoring</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight text-slate-900">{slide.header.title}</h3>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{slide.header.subtitle}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Content & Chart */}
                            <div className="flex-1 relative flex flex-col">
                                <div className="px-6 py-4">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">{slide.chart.item}</p>
                                            <div className="text-2xl font-extrabold text-slate-900">{slide.chart.price}</div>
                                        </div>
                                        <div className="bg-emerald-50 px-2 py-1 rounded-lg text-emerald-600 text-xs font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">trending_up</span>
                                            {slide.chart.change}
                                        </div>
                                    </div>
                                </div>

                                {/* Chart SVG */}
                                <div className="flex-1 relative w-full overflow-hidden">
                                    {currentSlide === 0 && (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/50 to-transparent border-t border-emerald-100"></div>
                                            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                                                <path d="M0,80 Q40,75 70,60 T140,55 T200,40 T260,45 T300,20" fill="none" stroke="#10b981" strokeLinecap="round" strokeWidth="3"></path>
                                                <circle className="animate-pulse" cx="200" cy="40" fill="#10b981" r="5">
                                                    <animate attributeName="r" dur="2s" repeatCount="indefinite" values="5;7;5"></animate>
                                                    <animate attributeName="stroke-opacity" dur="2s" repeatCount="indefinite" values="1;0;1"></animate>
                                                </circle>
                                                <circle cx="200" cy="40" fill="none" opacity="0.5" r="12" stroke="#10b981" strokeWidth="1">
                                                    <animate attributeName="r" dur="1.5s" repeatCount="indefinite" values="5;20"></animate>
                                                    <animate attributeName="opacity" dur="1.5s" repeatCount="indefinite" values="0.8;0"></animate>
                                                </circle>
                                            </svg>
                                        </>
                                    )}

                                    {currentSlide === 1 && (
                                        <div className="absolute inset-0 w-full h-full p-4 flex items-center justify-center">
                                            <div className="relative w-full h-full">
                                                {/* Abstract Map Dots */}
                                                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                                                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-emerald-500 rounded-full"></div>

                                                <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-emerald-400 rounded-full"></div>
                                                <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                </div>

                                                {/* Connecting Lines (Abstract) */}
                                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                                                    <path d="M80,40 L180,90 L220,50" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}

                                    {currentSlide === 2 && (
                                        <div className="absolute inset-0 w-full h-full p-6 flex items-end justify-around pb-2">
                                            <div className="w-16 bg-slate-100 rounded-t-lg relative group h-[40%]">
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">Avg</div>
                                            </div>
                                            <div className="w-16 bg-gradient-to-t from-emerald-500 to-green-500 rounded-t-lg relative group h-[80%] shadow-lg shadow-emerald-500/25">
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-sm border border-emerald-100">
                                                    <span className="text-xs font-bold text-emerald-600">-12%</span>
                                                </div>
                                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600">Best</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Stats Grid */}
                                <div className="px-6 pb-6 pt-2 grid grid-cols-2 gap-3 relative z-10">
                                    {slide.chart.stats.map((stat, index) => (
                                        <div key={index} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{stat.label}</p>
                                            <div className="flex items-center gap-1">
                                                <span className={`text-sm font-extrabold ${stat.isVerified ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                    {stat.value}
                                                </span>
                                                {stat.isVerified && <span className="material-symbols-outlined text-emerald-600 text-xs">verified</span>}
                                                {stat.icon && <span className="material-symbols-outlined text-slate-400 text-xs">{stat.icon}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content - Mobile Only */}
                    <div className="lg:hidden text-center max-w-xs mx-auto space-y-4 min-h-[140px]">
                        <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                            {slide.content.title} <span className="text-emerald-600">{slide.content.titleHighlight}</span>
                        </h1>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            {slide.content.description}
                        </p>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="p-6 pb-10 w-full relative z-30 lg:max-w-2xl lg:mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                            {onboardingSlides.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-200'
                                        }`}
                                ></div>
                            ))}
                        </div>
                        <button
                            onClick={handleNext}
                            disabled={isCompleting}
                            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                        >
                            {isCompleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                <>
                                    {slide.content.buttonText}
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
