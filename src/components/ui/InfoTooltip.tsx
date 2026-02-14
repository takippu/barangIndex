import React, { useState, useEffect, useRef } from 'react';

interface InfoTooltipProps {
    text: string;
    className?: string; // Allow valid class name prop
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Close on click outside for mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setIsVisible(false);
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible]);

    return (
        <div
            className={`relative inline-flex items-center justify-center ml-1.5 ${className}`}
            ref={tooltipRef}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={(e) => {
                e.stopPropagation();
                setIsVisible(!isVisible);
            }}
        >
            <span className="material-symbols-outlined text-slate-400 text-[16px] cursor-help hover:text-sky-500 transition-colors">
                info
            </span>
            {isVisible && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-slate-800/95 backdrop-blur-sm text-white text-[11px] leading-snug rounded-xl shadow-xl z-50 text-center border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                    {text}
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-800/95"></div>
                </div>
            )}
        </div>
    );
};
