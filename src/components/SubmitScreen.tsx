"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { apiGet, apiPost } from '@/src/lib/api-client';
import { DesktopHeader } from '@/src/components/DesktopHeader';
import { SearchableSelect } from '@/src/components/ui/SearchableSelect';
import { getPreferredRegionId } from '@/src/lib/region-preference';
import { SubmitScreenSkeleton } from '@/src/components/ui/Skeleton';

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
        <div className={`bg-slate-50 font-sans text-slate-900 antialiased min-h-screen ${className}`}>
            <DesktopHeader activeNav="/submit" showSubmitButton={false} />
            
            {toast ? (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className={`px-4 py-2.5 rounded-xl shadow-lg shadow-slate-200/50 text-sm font-bold border ${toast.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : toast.type === 'error'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                        {toast.message}
                    </div>
                </div>
            ) : null}

            <div className="max-w-md mx-auto lg:max-w-4xl lg:px-6 min-h-screen flex flex-col relative lg:pb-0 pb-24">
                {/* Mobile Header */}
                <header className="lg:hidden z-20 bg-slate-50/80 backdrop-blur-xl px-4 py-3 border-b border-slate-200/50">
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-soft hover:bg-slate-50 transition-colors text-slate-600" onClick={() => router.back()}>
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Community Report</h1>
                            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">Submit Price</h2>
                        </div>
                    </div>
                </header>

                {/* Desktop Header */}
                <div className="hidden lg:block px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <button 
                                    onClick={() => router.back()} 
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
                                >
                                    <span className="material-symbols-outlined text-base">arrow_back</span>
                                </button>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Community Report</span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">Submit Price</h1>
                            <p className="text-slate-500 mt-1">Help the community by sharing prices from your local market</p>
                        </div>
                    </div>
                </div>

                <main className="px-4 pt-6 lg:pt-0 pb-32 lg:pb-8 space-y-5 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                    {/* Left Column - Draft Preview & Price Input */}
                    <div className="space-y-5">
                    <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-5 lg:p-8 shadow-soft">
                        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
                        <p className="text-[10px] lg:text-xs uppercase tracking-widest text-slate-400 font-bold mb-2 relative z-10">Active Draft</p>
                        <p className="text-xl lg:text-2xl font-extrabold leading-tight pr-8 relative z-10">{selectedItemName}</p>
                        <p className="text-sm lg:text-base text-slate-400 mt-1 font-medium relative z-10 flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">storefront</span>
                            {selectedMarket ? `${selectedMarket.name} • ${selectedMarket.regionName}` : 'Select a market'}
                        </p>
                    </section>

                    <section className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 lg:p-8">
                        <label className="text-xs lg:text-sm font-bold uppercase tracking-widest text-slate-400" htmlFor="price-input">Price Input</label>
                        <div className="mt-3 lg:mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5 lg:p-8 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                            <div className="mb-2">
                                <span className="text-xs lg:text-sm font-semibold text-slate-500">Current Price (MYR)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl lg:text-3xl font-extrabold text-slate-400">RM</span>
                                <input
                                    autoFocus
                                    id="price-input"
                                    className="w-full bg-transparent border-0 text-5xl lg:text-6xl font-extrabold text-emerald-600 placeholder-slate-300 p-0 focus:outline-none focus:ring-0"
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
                    </div>

                    {/* Right Column - Form Fields */}
                    <section className="space-y-4 lg:space-y-5">
                        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-soft">
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

                        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-soft">
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
                                <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    Region: {selectedMarket.regionName}
                                </p>
                            )}
                        </div>

                        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-soft space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Location Details</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">Add context notes</p>
                                </div>
                                <button
                                    type="button"
                                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                                    onClick={handleUseCurrentLocation}
                                    disabled={geoLoading}
                                >
                                    <span className="material-symbols-outlined text-base">my_location</span>
                                    {geoLoading ? 'Locating...' : 'Use Current'}
                                </button>
                            </div>
                            <input
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-slate-900 placeholder-slate-400 bg-slate-50"
                                placeholder="e.g., Near LRT station / apartment area"
                                value={locationLabel}
                                onChange={(event) => setLocationLabel(event.target.value)}
                            />
                            {geoPoint ? (
                                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">check</span>
                                    GPS: {geoPoint.latitude.toFixed(5)}, {geoPoint.longitude.toFixed(5)}
                                </p>
                            ) : null}
                        </div>
                    </section>

                    {error && <div className="text-xs text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100 text-center font-medium">{error}</div>}
                    {success && <div className="text-xs text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center font-bold">{success}</div>}
                    {loading && <SubmitScreenSkeleton />}
                </main>

                {/* Mobile Submit Button */}
                <section className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-50/80 backdrop-blur-xl border-t border-slate-200/50 safe-area-bottom">
                    <div className="max-w-md mx-auto">
                        <button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                            onClick={handleSubmit}
                            disabled={submitting || loading}
                        >
                            <span>{submitting ? 'Submitting...' : 'Submit Price Report'}</span>
                            <span className="material-symbols-outlined text-xl">send</span>
                        </button>
                    </div>
                </section>

                {/* Desktop Submit Button */}
                <section className="hidden lg:block px-8 py-6">
                    <div className="flex justify-end">
                        <button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                            onClick={handleSubmit}
                            disabled={submitting || loading}
                        >
                            <span>{submitting ? 'Submitting...' : 'Submit Price Report'}</span>
                            <span className="material-symbols-outlined text-xl">send</span>
                        </button>
                    </div>
                </section>
            </div>

            {showCaptureModal ? (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center sm:items-center p-4">
                    <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-extrabold text-slate-900">AI Capture Receipt</h3>
                            <button
                                type="button"
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                                onClick={() => setShowCaptureModal(false)}
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">Choose how you want to provide a receipt image for automatic parsing.</p>

                        <div className="space-y-3">
                            <label className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 cursor-pointer transition-all group">
                                <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">photo_library</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-primary-700">Select from gallery</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleCaptureSelection} />
                            </label>

                            <label className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 cursor-pointer transition-all group">
                                <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">photo_camera</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-primary-700">Take photo now</span>
                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCaptureSelection} />
                            </label>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
