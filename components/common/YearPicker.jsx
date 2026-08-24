"use client";

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, X } from "lucide-react";

const YearPicker = ({
  value = null,
  onChange,
  placeholder = "Select year",
  className = "",
  disabled = false,
  width = "w-[160px]",
  minYear,
  maxYear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positioned, setPositioned] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const listRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const min = minYear ?? 1990;
  const max = maxYear ?? currentYear + 10;

  const years = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
      setPositioned(true);
    } else {
      setPositioned(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const targetYear = value !== null ? value : currentYear;
      const target = listRef.current.querySelector(
        `[data-year="${targetYear}"]`
      );
      if (target) {
        target.scrollIntoView({ block: "center" });
      }
    }
  }, [isOpen, value, positioned]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleClickOutside, true);
      window.addEventListener("resize", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleClickOutside, true);
      window.removeEventListener("resize", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (year) => {
    if (onChange) {
      onChange(year);
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange(null);
    }
    setIsOpen(false);
  };

  const dropdown = (
    <div
      ref={menuRef}
      className="fixed z-[9999] rounded-lg border border-gray-200 bg-white shadow-lg"
      style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <span className="text-sm font-medium text-[#043570]">Select Year</span>
        <span className="text-xs text-gray-400">
          {min} – {max}
        </span>
      </div>
      <ul
        ref={listRef}
        className="max-h-60 overflow-y-auto py-1"
      >
        {years.map((year) => (
          <li key={year}>
            <button
              type="button"
              data-year={year}
              onClick={() => handleSelect(year)}
              className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors ${
                value === year
                  ? "bg-[#0A4D99] font-medium text-white"
                  : "text-[#1f2937] hover:bg-gray-100"
              }`}
            >
              <span>{year}</span>
              {year === currentYear && value !== year && (
                <span className="text-xs text-gray-400">Current</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className={`relative ${width} ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`flex h-10 w-full items-center justify-between rounded-[10px] border border-slate-400 bg-white px-3 py-2 pr-9 text-left text-base font-normal leading-[1.4] text-[#1f2937] transition-all duration-200 focus:border-[#0A4D99] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
          isOpen ? "border-[#0A4D99]" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-600" />
          <span className={value !== null ? "text-[#1f2937]" : "text-gray-500"}>
            {value !== null ? value : placeholder}
          </span>
        </div>
        {value === null || disabled ? (
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        ) : null}
      </button>

      {value !== null && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear year"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#0A4D99]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {isOpen && positioned && mounted && createPortal(dropdown, document.body)}
    </div>
  );
};

export default YearPicker;
