"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { apiGet, apiPost } from '@/src/lib/api-client';
import { SearchableSelect } from '@/src/components/ui/SearchableSelect';
import { getPreferredRegionId } from '@/src/lib/region-preference';

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
    const [showCaptureModal, setShowCaptureModal] = useState(false);
    const [capturedFileName, setCapturedFileName] = useState<string | null>(null);
    const [locationLabel, setLocationLabel] = useState('');
    const [geoPoint, setGeoPoint] = useState<{ latitude: number; longitude: number } | null>(null);
    const [geoLoading, setGeoLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            try {
                const [itemRows, marketRows] = await Promise.all([
                    apiGet<Array<{ id: number; name: string }>>('/api/v1/items?limit=100'),
                    apiGet<Array<{ id: number; name: string; regionName: string }>>(`/api/v1/markets${getPreferredRegionId() ? `?regionId=${getPreferredRegionId()}` : ''}`),
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

    const handleCaptureSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setCapturedFileName(file.name);
        setShowCaptureModal(false);
        setToast({ type: 'info', message: 'Receipt captured. AI parsing will be added next.' });
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setToast({ type: 'error', message: 'Geolocation is not supported on this device.' });
            return;
        }

        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGeoPoint({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setGeoLoading(false);
                setToast({ type: 'success', message: 'Current location captured.' });
            },
            () => {
                setGeoLoading(false);
                setToast({ type: 'error', message: 'Unable to access your location.' });
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    return (
        <div className={`bg-[#f1f6f2] font-display text-[#1a2e21] antialiased min-h-screen pb-24 ${className}`}>
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
                <header className="sticky top-0 z-20 bg-[#f1f6f2]/90 backdrop-blur-md px-4 py-4 border-b border-[#17cf5a]/10">
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#17cf5a]/10 transition-colors" onClick={() => router.back()}>
                            <span className="material-symbols-outlined text-2xl">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-sm font-semibold text-[#17cf5a] uppercase tracking-wider">Community Report</h1>
                            <h2 className="text-lg font-extrabold leading-tight">Submit Latest Price</h2>
                        </div>
                    </div>
                </header>

                <main className="px-4 pt-4 pb-28 space-y-4">
                    <section className="relative overflow-hidden rounded-2xl bg-[#1a2e21] text-white p-4">
                        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[#17cf5a]/20 blur-2xl" />
                        <p className="text-[11px] uppercase tracking-widest text-white/70 font-bold mb-1">Active Draft</p>
                        <p className="text-lg font-extrabold leading-tight pr-8">{selectedItemName}</p>
                        <p className="text-xs text-white/70 mt-1">{selectedMarket ? `${selectedMarket.name} • ${selectedMarket.regionName}` : 'Select a market'}</p>
                    </section>

                    <section className="bg-white rounded-2xl border border-[#17cf5a]/10 shadow-sm p-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400" htmlFor="price-input">Price Input</label>
                        <div className="mt-3 rounded-xl border border-[#17cf5a]/15 bg-[#f8fbf9] p-4">
                            <div className="mb-2">
                                <span className="text-xs font-semibold text-gray-500">Current Price (MYR)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-extrabold text-gray-400">RM</span>
                                <input
                                    autoFocus
                                    id="price-input"
                                    className="w-full bg-transparent border-0 text-5xl font-extrabold text-[#17cf5a] placeholder-[#17cf5a]/30 p-0 focus:outline-none focus:ring-0"
                                    placeholder="0.00"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(event) => setPrice(event.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/10 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">AI Capture</p>
                                    <p className="text-sm font-semibold text-[#1a2e21] mt-1">Scan receipt to auto-fill fields</p>
                                    {capturedFileName ? (
                                        <p className="text-xs text-gray-500 mt-1 truncate">Selected: {capturedFileName}</p>
                                    ) : null}
                                </div>
                                <button
                                    type="button"
                                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#17cf5a]/10 text-[#17cf5a] text-xs font-bold hover:bg-[#17cf5a]/20 transition-colors"
                                    onClick={() => setShowCaptureModal(true)}
                                >
                                    <span className="material-symbols-outlined text-base">photo_camera</span>
                                    AI Capture
                                </button>
                            </div>
                        </div>

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

                        <div className="bg-white p-4 rounded-xl border border-[#17cf5a]/10 shadow-sm space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Location</p>
                                    <p className="text-sm font-semibold text-[#1a2e21] mt-1">Add your nearby location for better context</p>
                                </div>
                                <button
                                    type="button"
                                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#17cf5a]/10 text-[#17cf5a] text-xs font-bold hover:bg-[#17cf5a]/20 transition-colors"
                                    onClick={handleUseCurrentLocation}
                                    disabled={geoLoading}
                                >
                                    <span className="material-symbols-outlined text-base">my_location</span>
                                    {geoLoading ? 'Locating...' : 'Use Current'}
                                </button>
                            </div>
                            <input
                                className="w-full border border-[#17cf5a]/15 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#17cf5a]/40 focus:border-[#17cf5a] outline-none"
                                placeholder="e.g., Near LRT station / apartment area"
                                value={locationLabel}
                                onChange={(event) => setLocationLabel(event.target.value)}
                            />
                            {geoPoint ? (
                                <p className="text-xs text-gray-500">
                                    GPS: {geoPoint.latitude.toFixed(5)}, {geoPoint.longitude.toFixed(5)}
                                </p>
                            ) : null}
                        </div>
                    </section>

                    {error && <p className="text-xs text-red-500 px-1">{error}</p>}
                    {success && <p className="text-xs text-[#17cf5a] px-1">{success}</p>}
                    {loading && <p className="text-xs text-gray-500 px-1">Loading form options...</p>}
                </main>

                <section className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-6 pt-3 bg-gradient-to-t from-[#f1f6f2] via-[#f1f6f2] to-transparent">
                    <div className="rounded-2xl border border-[#17cf5a]/15 bg-white p-3 shadow-lg">
                        <button
                            className="w-full bg-[#17cf5a] hover:bg-[#17cf5a]/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#17cf5a]/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            onClick={handleSubmit}
                            disabled={submitting || loading}
                        >
                            <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
                            <span className="material-symbols-outlined text-lg">send</span>
                        </button>
                    </div>
                </section>
            </div>

            {showCaptureModal ? (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
                    <div className="w-full max-w-md bg-white rounded-t-2xl p-4 border-t border-[#17cf5a]/10 shadow-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-extrabold">AI Capture Receipt</h3>
                            <button
                                type="button"
                                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                onClick={() => setShowCaptureModal(false)}
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Choose how you want to provide a receipt image.</p>

                        <div className="space-y-2">
                            <label className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-[#17cf5a]/40 hover:bg-[#17cf5a]/5 cursor-pointer">
                                <span className="material-symbols-outlined text-[#17cf5a]">photo_library</span>
                                <span className="text-sm font-semibold">Select from gallery</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleCaptureSelection} />
                            </label>

                            <label className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-[#17cf5a]/40 hover:bg-[#17cf5a]/5 cursor-pointer">
                                <span className="material-symbols-outlined text-[#17cf5a]">photo_camera</span>
                                <span className="text-sm font-semibold">Take photo now</span>
                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCaptureSelection} />
                            </label>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
