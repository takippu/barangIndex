"use client";

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface LoginScreenProps {
    readonly className?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ className = '' }) => {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') ?? '/home';
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const callbackURL = redirectTo.startsWith('/') ? redirectTo : '/home';

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/sign-in/social', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    provider: 'google',
                    callbackURL,
                    disableRedirect: true,
                }),
            });

            const raw = await response.text();
            const payload = raw ? (JSON.parse(raw) as { url?: string }) : {};

            const redirectUrl = payload.url ?? response.headers.get('location') ?? null;
            if (!response.ok || !redirectUrl) {
                throw new Error('Failed to start Google sign-in.');
            }

            window.location.href = redirectUrl;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start Google sign-in.');
            setIsLoading(false);
        }
    };

    return (
        <div className={`bg-white  font-display text-slate-800  min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ${className}`}>
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#17cf5a]/10 to-transparent pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#17cf5a]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#17cf5a]/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Main Container */}
            <div className="w-full max-w-md mx-auto z-10 flex flex-col h-full justify-between sm:justify-center min-h-[600px] sm:min-h-0">
                {/* Header Section */}
                <div className="text-center mb-10 pt-8 sm:pt-0">
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-8 gap-2">
                        <div className="w-10 h-10 bg-[#17cf5a]/20 rounded-xl flex items-center justify-center text-[#17cf5a]">
                            <span className="material-symbols-outlined text-2xl">shopping_basket</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            <span className="text-[#0f172a] ">Grocery</span><span className="text-[#17cf5a]">Index</span>
                        </h1>
                    </div>
                    <h2 className="text-2xl font-bold text-[#0f172a]  mb-2">Sign In</h2>
                    <p className="text-slate-500  font-medium">Continue with Google to access your account.</p>
                </div>

                <div className="space-y-5 mb-8">
                    <button disabled={isLoading} onClick={() => void handleGoogleSignIn()} type="button" className="w-full bg-[#17cf5a] hover:bg-[#12a346] active:scale-[0.98] disabled:opacity-60 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#17cf5a]/30 transition-all duration-200 flex items-center justify-center gap-2 mt-4 group">
                        <span>{isLoading ? 'Redirecting...' : 'Continue with Google'}</span>
                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center pb-6 sm:pb-0">
                    <p className="text-sm text-slate-500 ">
                        By continuing, you agree to our{" "}
                        <Link className="font-bold text-[#17cf5a] hover:text-[#12a346] transition-colors inline-flex items-center gap-1 group" href="/onboarding">
                            onboarding guide
                            <span className="material-symbols-outlined text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">chevron_right</span>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
