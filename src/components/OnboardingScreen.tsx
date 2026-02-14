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

    const handleComplete = () => {
        // Set cookie to expire in 1 year
        document.cookie = "grocery_index_visited=true; path=/; max-age=31536000";
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
        <div className={`bg-[#f6f8f7]  font-display text-[#1a2e21]  antialiased flex flex-col justify-between min-h-screen ${className}`}>
            <div className="max-w-md mx-auto w-full min-h-screen flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 z-20">
                    <button onClick={handleComplete} className="text-sm font-bold text-gray-500 hover:text-[#17cf5a] transition-colors">Skip</button>
                </div>

                {/* Background Blurs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-[#17cf5a]/10 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-[#17cf5a]/5 rounded-full blur-[100px]"></div>

                {/* Card Section */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
                    <div className="relative w-full max-w-[340px] aspect-[4/5] mb-12">
                        {/* Stacked Cards Effect */}
                        <div className="absolute inset-0 bg-white/50  rounded-3xl transform rotate-6 scale-90 translate-y-4 shadow-sm border border-[#17cf5a]/5 z-0"></div>
                        <div className="absolute inset-0 bg-white/80  rounded-3xl transform -rotate-3 scale-95 translate-y-2 shadow-md border border-[#17cf5a]/5 z-0"></div>

                        {/* Main Card */}
                        <div className="absolute inset-0 bg-white  border border-[#17cf5a]/10 shadow-xl rounded-3xl overflow-hidden flex flex-col z-10 transition-all duration-500 key={currentSlide}">
                            {/* Card Header */}
                            <div className="p-6 border-b border-gray-100 ">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-[#17cf5a]/10 flex items-center justify-center text-[#17cf5a]">
                                        <span className="material-symbols-outlined fill-1">monitoring</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{slide.header.title}</h3>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{slide.header.subtitle}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Content & Chart */}
                            <div className="flex-1 relative flex flex-col">
                                <div className="px-6 py-4">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">{slide.chart.item}</p>
                                            <div className="text-2xl font-extrabold text-[#1a2e21] ">{slide.chart.price}</div>
                                        </div>
                                        <div className="bg-[#17cf5a]/10 px-2 py-1 rounded-lg text-[#17cf5a] text-xs font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">trending_up</span>
                                            {slide.chart.change}
                                        </div>
                                    </div>
                                </div>

                                {/* Chart SVG */}
                                <div className="flex-1 relative w-full overflow-hidden">
                                    {currentSlide === 0 && (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-b from-[#17cf5a]/15 to-transparent border-t border-[#17cf5a]/5"></div>
                                            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                                                <path d="M0,80 Q40,75 70,60 T140,55 T200,40 T260,45 T300,20" fill="none" stroke="#17cf5a" strokeLinecap="round" strokeWidth="3"></path>
                                                <circle className="animate-pulse" cx="200" cy="40" fill="#17cf5a" r="5">
                                                    <animate attributeName="r" dur="2s" repeatCount="indefinite" values="5;7;5"></animate>
                                                    <animate attributeName="stroke-opacity" dur="2s" repeatCount="indefinite" values="1;0;1"></animate>
                                                </circle>
                                                <circle cx="200" cy="40" fill="none" opacity="0.5" r="12" stroke="#17cf5a" strokeWidth="1">
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
                                                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-[#17cf5a] rounded-full animate-ping opacity-75"></div>
                                                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-[#17cf5a] rounded-full"></div>

                                                <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-orange-400 rounded-full"></div>
                                                <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-[#17cf5a]/20 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-[#17cf5a] rounded-full"></div>
                                                </div>

                                                {/* Connecting Lines (Abstract) */}
                                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                                                    <path d="M80,40 L180,90 L220,50" fill="none" stroke="#1a2e21" strokeWidth="1" strokeDasharray="4 4" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}

                                    {currentSlide === 2 && (
                                        <div className="absolute inset-0 w-full h-full p-6 flex items-end justify-around pb-2">
                                            <div className="w-16 bg-gray-100 rounded-t-lg relative group h-[40%]">
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">Avg</div>
                                            </div>
                                            <div className="w-16 bg-gradient-to-t from-[#17cf5a] to-[#2ecc71] rounded-t-lg relative group h-[80%] shadow-lg shadow-[#17cf5a]/20">
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-sm border border-[#17cf5a]/20">
                                                    <span className="text-xs font-bold text-[#17cf5a]">-12%</span>
                                                </div>
                                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#17cf5a]">Best</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Stats Grid */}
                                <div className="px-6 pb-6 pt-2 grid grid-cols-2 gap-3 relative z-10">
                                    {slide.chart.stats.map((stat, index) => (
                                        <div key={index} className="bg-[#f6f8f7]  rounded-xl p-3 border border-[#17cf5a]/5">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{stat.label}</p>
                                            <div className="flex items-center gap-1">
                                                <span className={`text-sm font-extrabold ${stat.isVerified ? 'text-[#17cf5a]' : 'text-[#1a2e21]'}`}>
                                                    {stat.value}
                                                </span>
                                                {stat.isVerified && <span className="material-symbols-outlined text-[#17cf5a] text-xs">verified</span>}
                                                {stat.icon && <span className="material-symbols-outlined text-gray-400 text-xs">{stat.icon}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center max-w-xs mx-auto space-y-4 min-h-[140px]">
                        <h1 className="text-2xl font-extrabold text-[#1a2e21]  leading-tight">
                            {slide.content.title} <span className="text-[#17cf5a]">{slide.content.titleHighlight}</span>
                        </h1>
                        <p className="text-sm text-gray-500  font-medium leading-relaxed">
                            {slide.content.description}
                        </p>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="p-6 pb-10 w-full relative z-30">
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                            {onboardingSlides.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-[#17cf5a]' : 'w-2 bg-[#17cf5a]/20'
                                        }`}
                                ></div>
                            ))}
                        </div>
                        <button onClick={handleNext} className="flex items-center gap-2 bg-[#1a2e21]  text-white  px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                            {slide.content.buttonText}
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
