"use client";

import React from 'react';
import Link from 'next/link';
import { loginData } from '../data/loginData';

interface LoginScreenProps {
    readonly className?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ className = '' }) => {
    return (
        <div className={`bg-white  font-display text-slate-800  min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden ${className}`}>
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#17cf5a]/10 to-transparent pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#17cf5a]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#17cf5a]/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Main Container */}
            <div className="w-full max-w-sm mx-auto z-10 flex flex-col h-full justify-between sm:justify-center min-h-[600px] sm:min-h-0">
                {/* Header Section */}
                <div className="text-center mb-10 pt-8 sm:pt-0">
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-8 gap-2">
                        <div className="w-10 h-10 bg-[#17cf5a]/20 rounded-xl flex items-center justify-center text-[#17cf5a]">
                            <span className="material-symbols-outlined text-2xl">shopping_basket</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            <span className="text-[#0f172a] ">{loginData.header.titlePrefix}</span><span className="text-[#17cf5a]">{loginData.header.titleSuffix}</span>
                        </h1>
                    </div>
                    <h2 className="text-2xl font-bold text-[#0f172a]  mb-2">{loginData.header.welcome}</h2>
                    <p className="text-slate-500  font-medium">{loginData.header.subtitle}</p>
                </div>

                {/* Login Form */}
                <form className="space-y-5 mb-8" onSubmit={(e) => e.preventDefault()}>
                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700  ml-1" htmlFor="email">{loginData.form.emailLabel}</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <span className="material-symbols-outlined text-xl">mail</span>
                            </span>
                            <input className="w-full pl-11 pr-4 py-3.5 bg-[#f6f8f7]  border border-slate-200  rounded-xl text-slate-900  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17cf5a]/50 focus:border-[#17cf5a] transition-all duration-200 shadow-sm" id="email" name="email" placeholder={loginData.form.emailPlaceholder} type="email" />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between ml-1">
                            <label className="block text-sm font-semibold text-slate-700 " htmlFor="password">{loginData.form.passwordLabel}</label>
                            <a className="text-xs font-semibold text-[#17cf5a] hover:text-[#12a346] transition-colors" href="#">{loginData.form.forgotPassword}</a>
                        </div>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <span className="material-symbols-outlined text-xl">lock</span>
                            </span>
                            <input className="w-full pl-11 pr-12 py-3.5 bg-[#f6f8f7]  border border-slate-200  rounded-xl text-slate-900  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17cf5a]/50 focus:border-[#17cf5a] transition-all duration-200 shadow-sm" id="password" name="password" placeholder={loginData.form.passwordPlaceholder} type="password" />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600  transition-colors" type="button">
                                <span className="material-symbols-outlined text-xl">visibility_off</span>
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <Link href="/" className="w-full bg-[#17cf5a] hover:bg-[#12a346] active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#17cf5a]/30 transition-all duration-200 flex items-center justify-center gap-2 mt-4 group">
                        <span>{loginData.form.submitButton}</span>
                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                </form>

                {/* Social Login Section */}
                <div className="space-y-6">
                    <div className="relative flex items-center justify-center">
                        <div className="border-t border-slate-200  w-full absolute"></div>
                        <span className="bg-white  px-4 text-xs font-semibold text-slate-400 relative z-10 uppercase tracking-wider">{loginData.social.divider}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 py-3 px-4 border border-slate-200  rounded-xl hover:bg-slate-50  transition-colors group bg-white ">
                            <img alt="Google Logo" className="w-5 h-5 group-hover:scale-110 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgdSHFKDIg-e4asn_Bap3YZXW_iIf9Y9QGLJFr_dtw64khZ13lHTA2tRBNUr2XGlXGyH3wH1uzJMd9e2DEzeMqmAt2obE-o0jn_uabC6UC9qgAiTL--Yl-I6EMK9rYMYmfOeEKqjbdvDbq7ebe--s81ah7_GU1tzNUtK1XDnVw-i19XlZCPcfmpFs_THqTnzTlSpYb60gP2w4R6h2LhauvjKSgVEipQlnwzwO2MiKr_YVgTYjQtCzZUIUPdBtkPHJ2QHs7OX8DDgo" />
                            <span className="text-sm font-semibold text-slate-700 ">{loginData.social.google}</span>
                        </button>
                        <button className="flex items-center justify-center gap-3 py-3 px-4 border border-slate-200  rounded-xl hover:bg-slate-50  transition-colors group bg-white ">
                            <img alt="Apple Logo" className="w-5 h-5  group-hover:scale-110 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0RGRRCHvCr4Lk7xDv3FjJZ4FFeYE53ZQMr8eqRqXz57XmLnUWExBh8_M13NvaoCXjivpQS7zWjuRLKNIMyJeM1ef-b6mAfQuI97k1KQkz2Q8xzzcg1wxvr5D6jAKaBhW5KPT0S6LJufoXgzSRV4QFo7z95ke2yZ6luK8m4yPFNpY8FCQyK1GeP1VYtvh1UmgsAOXPvEV0ZHVEoJu5upJOnqtQMBlmx_KyDEJqxzm-uytlNM8ZydQoiISwTpluOTCZQT5i3SCp1rE" />
                            <span className="text-sm font-semibold text-slate-700 ">{loginData.social.apple}</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center pb-6 sm:pb-0">
                    <p className="text-sm text-slate-500 ">
                        {loginData.footer.text}{" "}
                        <Link className="font-bold text-[#17cf5a] hover:text-[#12a346] transition-colors inline-flex items-center gap-1 group" href={loginData.footer.linkUrl}>
                            {loginData.footer.linkText}
                            <span className="material-symbols-outlined text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">chevron_right</span>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
