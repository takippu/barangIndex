"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Option = {
  value: number;
  label: string;
  hint?: string;
  searchText?: string;
};

type SearchableSelectProps = {
  label: string;
  placeholder: string;
  options: Option[];
  value: number | null;
  onChange: (nextValue: number) => void;
  disabled?: boolean;
  emptyMessage?: string;
  showLabel?: boolean;
  inputPlaceholder?: string;
  containerClassName?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
};

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  emptyMessage = "No results found.",
  showLabel = true,
  inputPlaceholder = "Search...",
  containerClassName = "",
  buttonClassName = "",
  dropdownClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((option) => {
      const target = `${option.label} ${option.hint ?? ""} ${option.searchText ?? ""}`.toLowerCase();
      return target.includes(keyword);
    });
  }, [options, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  return (
    <div className={`relative ${containerClassName}`} ref={containerRef}>
      {showLabel ? <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</label> : null}
      <button
        type="button"
        className={`w-full ${showLabel ? "mt-2" : ""} p-3 rounded-lg border border-gray-200 text-sm font-semibold bg-white flex items-center justify-between disabled:opacity-60 ${buttonClassName}`}
        onClick={() => !disabled && setOpen((current) => !current)}
        disabled={disabled}
      >
        <span className={`truncate ${selected ? "text-[#1a2e21]" : "text-gray-400"}`}>
          {selected?.label ?? placeholder}
        </span>
        <span className="material-symbols-outlined text-base text-gray-500">expand_more</span>
      </button>

      {open ? (
        <div className={`absolute z-40 left-0 right-0 mt-2 bg-white border border-[#17cf5a]/20 rounded-xl shadow-xl overflow-hidden ${dropdownClassName}`}>
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-base">search</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
                placeholder={inputPlaceholder}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#17cf5a]/40 focus:border-[#17cf5a]"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500">{emptyMessage}</div>
            ) : (
              filtered.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`w-full text-left px-3 py-2.5 hover:bg-[#17cf5a]/5 transition-colors ${
                    option.value === value ? "bg-[#17cf5a]/10" : ""
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <p className="text-sm font-semibold text-[#1a2e21]">{option.label}</p>
                  {option.hint ? (
                    <p className="text-xs text-gray-500 mt-0.5">{option.hint}</p>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
