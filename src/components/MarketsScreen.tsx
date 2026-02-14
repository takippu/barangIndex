"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { apiGet } from '@/src/lib/api-client';
import { getItemIcon } from '@/src/lib/item-icons';

interface MarketsScreenProps {
    readonly className?: string;
}

type Market = {
    id: number;
    name: string;
    category: string;
    defaultUnit: string;
    currency: string;
};

export const MarketsScreen: React.FC<MarketsScreenProps> = ({ className = '' }) => {
    const router = useRouter();
    const [items, setItems] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await apiGet<Market[]>('/api/v1/items?limit=100');
                if (!mounted) return;
                setItems(data);
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load items');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void load();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className={`bg-[#f6f8f7] font-display text-[#1a2e21] antialiased min-h-screen pb-24 ${className}`}>
            <div className="max-w-xl mx-auto min-h-screen flex flex-col">

                {/* Header */}
                <header className="sticky top-0 z-20 bg-[#f6f8f7]/95 backdrop-blur-md px-6 pt-8 pb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#1a2e21]">Items Overview</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">Browse tracked items from community reports</p>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-[#17cf5a]">
                        <span className="material-symbols-outlined">filter_list</span>
                    </button>
                </header>

                {/* Cards Container */}
                <div className="px-4 space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => router.push(`/search?query=${encodeURIComponent(item.name)}`)}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-[#17cf5a]/10 active:scale-[0.98] transition-all cursor-pointer"
                        >
                            {/* Card Header */}
                            <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-3">
                                <div className="w-10 h-10 rounded-xl bg-[#17cf5a]/10 flex items-center justify-center text-[#17cf5a] shrink-0">
                                    <span className="text-xl">{getItemIcon(item.name, item.category)}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-base text-[#1a2e21]">{item.name}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.category}</div>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-[#17cf5a]/10 text-[#17cf5a]">
                                    <span className="material-symbols-outlined text-[12px]">sell</span>
                                    #{item.id}
                                </div>
                            </div>

                            {/* Card Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Category</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-extrabold text-lg text-[#1a2e21]">{item.category}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Currency</p>
                                    <span className="font-bold text-sm text-[#1a2e21]">{item.currency}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Default Unit</p>
                                    <span className="font-medium text-sm text-gray-600">{item.defaultUnit}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Action</p>
                                    <span className="font-medium text-sm text-[#17cf5a]">View prices</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!loading && items.length === 0 && (
                        <div className="text-sm text-gray-500 px-2">No active items found.</div>
                    )}
                    {loading && (
                        <div className="text-sm text-gray-500 px-2">Loading items...</div>
                    )}
                    {error && (
                        <div className="text-sm text-red-500 px-2">{error}</div>
                    )}
                </div>

            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-[#17cf5a]/10 px-6 py-3 flex justify-between items-center z-30">
                <Link href="/home" className="flex flex-col items-center gap-1 group">
                    <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-[#17cf5a] transition-colors">storefront</span>
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#17cf5a] transition-colors">Home</span>
                </Link>
                <Link href="/markets" className="flex flex-col items-center gap-1 group">
                    <span className="material-symbols-outlined text-2xl text-[#17cf5a] transition-colors">bar_chart</span>
                    <span className="text-[10px] font-bold text-[#17cf5a] transition-colors">Items</span>
                </Link>
                <div className="relative -top-6">
                    <Link href="/submit" className="w-14 h-14 bg-[#17cf5a] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#17cf5a]/40 hover:scale-110 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </Link>
                </div>
                <button className="flex flex-col items-center gap-1 group">
                    <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-[#17cf5a] transition-colors">notifications</span>
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#17cf5a] transition-colors">Alerts</span>
                </button>
                <Link href="/profile" className="flex flex-col items-center gap-1 group">
                    <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-[#17cf5a] transition-colors">person</span>
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#17cf5a] transition-colors">Profile</span>
                </Link>
            </nav>
        </div>
    );
};
