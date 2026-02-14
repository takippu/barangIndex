/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#10B981', // Deep Emerald
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B',
                },
                slate: {
                    50: '#F8FAFC', // Main Background
                    100: '#F1F5F9', // Secondary Background
                    200: '#E2E8F0', // Borders
                    300: '#CBD5E1', // Icons/Disabled
                    400: '#94A3B8', // Placeholder Text
                    500: '#64748B', // Secondary Text
                    600: '#475569', // Body Text
                    700: '#334155', // Headings
                    800: '#1E293B', // Strong Headings
                    900: '#0F172A', // Nav/Footer
                }
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['var(--font-plus-jakarta)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 2px 12px -4px rgba(0, 0, 0, 0.08)',
                'soft-lg': '0 8px 24px -6px rgba(0, 0, 0, 0.12)',
                'glow': '0 0 12px -2px rgba(16, 185, 129, 0.2)',
            },
            borderRadius: {
                '3xl': '1.5rem',
            }
        },
    },
    plugins: [],
}
