"use client";

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface LoginScreenProps {
    readonly className?: string;
}

// Google SVG Icon
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);

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
        <div className={`min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden ${className}`}>
            {/* Soft gradient background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-cyan-50" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl" />
            </div>

            {/* Main Card - Soft UI */}
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 lg:p-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/25 mb-6">
                            <span className="material-symbols-outlined text-3xl">shopping_basket</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Welcome to Grocery<span className="text-sky-600">Index</span>
                        </h1>
                        <p className="text-slate-500">
                            Sign in to contribute to price transparency
                        </p>
                    </div>

                    {/* Google Sign In Button */}
                    <div className="space-y-4">
                        <button 
                            disabled={isLoading} 
                            onClick={() => void handleGoogleSignIn()} 
                            type="button" 
                            className="w-full bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-700 font-semibold py-4 px-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-200 flex items-center justify-center gap-3 group hover:shadow-md hover:border-slate-300"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
                                    <span>Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <GoogleIcon />
                                    <span>Continue with Google</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                                <p className="text-sm text-rose-600 text-center flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-base">error</span>
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-white text-sm text-slate-400">or</span>
                        </div>
                    </div>

                    {/* Browse as Guest */}
                    <Link
                        href="/markets"
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">store</span>
                        Browse Markets as Guest
                    </Link>

                    {/* Trust indicators */}
                    <div className="mt-8 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="material-symbols-outlined text-emerald-500 text-lg">verified</span>
                            Secure
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="material-symbols-outlined text-sky-500 text-lg">public</span>
                            Open Data
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-slate-500">
                    By signing in, you agree to our{" "}
                    <Link href="/onboarding" className="font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                        Community Guidelines
                    </Link>
                </p>
            </div>
        </div>
    );
};
