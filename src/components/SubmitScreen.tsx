"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { apiGet, apiPost } from '@/src/lib/api-client';
import { SearchableSelect } from '@/src/components/ui/SearchableSelect';

interface SubmitScreenProps {
    readonly className?: string;
}

type Item = {
    id: number;
    name: string;
};

type Market = {
    id: number;
    name: string;
    regionName: string;
};

type SubmitResponse = {
    id: number;
    status: string;
    reportedAt: string;
};

export const SubmitScreen: React.FC<SubmitScreenProps> = ({ className = '' }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [items, setItems] = useState<Item[]>([]);
    const [markets, setMarkets] = useState<Market[]>([]);
    const [itemId, setItemId] = useState<number | null>(null);
    const [marketId, setMarketId] = useState<number | null>(null);
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            try {
                const [itemRows, marketRows] = await Promise.all([
                    apiGet<Array<{ id: number; name: string }>>('/api/v1/items?limit=100'),
                    apiGet<Array<{ id: number; name: string; regionName: string }>>('/api/v1/markets'),
                ]);
                if (!mounted) return;

                setItems(itemRows);
                setMarkets(marketRows);

                const itemIdFromQuery = Number.parseInt(searchParams.get('itemId') ?? '', 10);
                const selectedItemId = Number.isFinite(itemIdFromQuery) ? itemIdFromQuery : itemRows[0]?.id;
                setItemId(selectedItemId ?? null);
                setMarketId(marketRows[0]?.id ?? null);
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load form data');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void load();
        return () => {
            mounted = false;
        };
    }, [searchParams]);

    const selectedItemName = useMemo(() => {
        return items.find((item) => item.id === itemId)?.name ?? 'Select item';
    }, [itemId, items]);

    const selectedMarket = useMemo(() => {
        return markets.find((market) => market.id === marketId) ?? null;
    }, [marketId, markets]);

    useEffect(() => {
        if (!toast) return;
        const timeout = setTimeout(() => setToast(null), 2200);
        return () => clearTimeout(timeout);
    }, [toast]);

    const handleSubmit = async () => {
        if (!itemId || !marketId) {
            setError('Please select item and market.');
            return;
        }

        const numericPrice = Number.parseFloat(price);
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            setError('Enter a valid price greater than 0.');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await apiPost<SubmitResponse>('/api/v1/price-reports', {
                itemId,
                marketId,
                price: numericPrice,
            });
            setSuccess(`Report submitted (${response.status}). Redirecting...`);
            setToast({ type: 'success', message: 'Report submitted successfully' });
            setPrice('');
            router.push(`/reports/${response.id}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to submit report';
            if (message.toLowerCase().includes('authentication required')) {
                setToast({ type: 'info', message: 'Please login to submit a report' });
                router.push('/login?redirect=%2Fsubmit');
                return;
            }
            setError(message);
            setToast({ type: 'error', message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`bg-[#f6f8f7] font-display text-[#1a2e21] antialiased min-h-screen pb-24 ${className}`}>
            {toast ? (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className={`px-4 py-2 rounded-lg shadow-lg text-sm font-semibold border ${
                        toast.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : toast.type === 'error'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                        {toast.message}
                    </div>
                </div>
            ) : null}
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
                <header className="sticky top-0 z-20 bg-[#f6f8f7]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-[#17cf5a]/10">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors" onClick={() => router.back()}>
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <div className="flex-1 px-3 text-center">
                        <h1 className="text-sm font-semibold text-[#17cf5a] uppercase tracking-wider">New Report</h1>
                        <h2 className="text-lg font-extrabold leading-tight truncate">Submit Price</h2>
                    </div>
                    <div className="w-10 h-10" />
                </header>

                <section className="px-6 pt-6 pb-2 text-center">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#17cf5a]/10 mb-4 shadow-sm">
                        <div className="w-6 h-6 rounded bg-[#17cf5a]/20 flex items-center justify-center text-[#17cf5a]">
                            <span className="material-symbols-outlined text-base">inventory_2</span>
                        </div>
                        <span className="text-sm font-bold">{selectedItemName}</span>
                    </div>
                </section>

                <section className="px-6 flex flex-col items-center justify-center py-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2" htmlFor="price-input">Current Price (MYR)</label>
                    <div className="relative w-full max-w-[280px]">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-300">RM</span>
                        <input
                            autoFocus
                            id="price-input"
                            className="w-full bg-transparent border-0 border-b-2 border-[#17cf5a]/30 focus:border-[#17cf5a] text-center text-6xl font-extrabold text-[#17cf5a] placeholder-[#17cf5a]/30 px-0 py-4 focus:outline-none focus:ring-0"
                            placeholder="0.00"
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                        />
                    </div>
                </section>

                <section className="px-4 py-6 space-y-5">
                    <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/10 shadow-sm">
                        <SearchableSelect
                            label="Item"
                            placeholder="Select item"
                            value={itemId}
                            disabled={loading}
                            onChange={(nextItemId) => setItemId(nextItemId)}
                            options={items.map((item) => ({
                                value: item.id,
                                label: item.name,
                            }))}
                            emptyMessage="No matching items."
                        />
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/10 shadow-sm">
                        <SearchableSelect
                            label="Market"
                            placeholder="Select market"
                            value={marketId}
                            disabled={loading}
                            onChange={(nextMarketId) => setMarketId(nextMarketId)}
                            options={markets.map((market) => ({
                                value: market.id,
                                label: market.name,
                                hint: market.regionName,
                                searchText: `${market.name} ${market.regionName}`,
                            }))}
                            emptyMessage="No matching markets."
                        />
                        {selectedMarket && (
                            <p className="text-xs text-gray-500 mt-2">Region: {selectedMarket.regionName}</p>
                        )}
                    </div>
                </section>

                <section className="mx-4 mt-auto mb-6 bg-[#17cf5a]/5 p-5 rounded-2xl border border-[#17cf5a]/10">
                    <button
                        className="w-full mt-2 bg-[#17cf5a] hover:bg-[#17cf5a]/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#17cf5a]/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={submitting || loading}
                    >
                        <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
                        <span className="material-symbols-outlined text-lg">send</span>
                    </button>
                    {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
                    {success && <p className="text-xs text-[#17cf5a] mt-3">{success}</p>}
                    {loading && <p className="text-xs text-gray-500 mt-3">Loading form options...</p>}
                </section>
            </div>
        </div>
    );
};
