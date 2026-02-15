"use client";

import React, { useEffect, useState } from "react";

export const PWAInstallBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone || document.referrer.includes('android-app://');

        if (isStandalone) {
            return;
        }

        // For Android/Desktop (Chrome/Edge)
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // For iOS, show banner if not standalone (simplified check)
        if (isIOSDevice) {
            setIsVisible(true);
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="relative z-[100] bg-slate-900 text-white px-4 py-2 shadow-lg animate-in slide-in-from-top duration-300 border-b border-slate-800">
            <div className="flex items-center justify-between gap-3 w-full max-w-7xl mx-auto">
                {/* App Info */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white p-1 shrink-0">
                        <img src="/icon-192x192.svg" alt="App Icon" className="w-full h-full object-contain rounded-md" />
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-tight">Install GroceryIndex</p>
                        <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">Install for a better experience</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {isIOS && showIOSInstructions ? (
                        <div className="text-xs font-medium animate-in fade-in slide-in-from-right mr-1 flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                            <span>Tap share</span>
                            <span className="material-symbols-outlined text-base">ios_share</span>
                            <span>then "Add to Home"</span>
                        </div>
                    ) : (
                        <button
                            onClick={isIOS ? () => setShowIOSInstructions(true) : handleInstallClick}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors whitespace-nowrap shadow-lg shadow-emerald-900/20"
                        >
                            Install
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800 border border-transparent hover:border-slate-700"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
