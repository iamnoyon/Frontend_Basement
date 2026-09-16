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
  width = "w-[180px]",
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
      className="fixed z-[9999] rounded-lg border border-[var(--color-gray-200)] bg-[var(--color-white)] shadow-lg"
      style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-gray-100)] px-3 py-2">
        <span className="text-sm font-medium text-[var(--color-primary)]">Select Year</span>
        <span className="text-xs text-[var(--color-gray-400)]">
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
                  ? "bg-[var(--color-primary-light)] font-medium text-[var(--color-white)]"
                  : "text-[var(--color-text-heading)] hover:bg-[var(--color-gray-100)]"
              }`}
            >
              <span>{year}</span>
              {year === currentYear && value !== year && (
                <span className="text-xs text-[var(--color-gray-400)]">Current</span>
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
        className={`flex h-10 w-full items-center justify-between rounded-[10px] border border-[var(--color-slate-400)] bg-[var(--color-white)] px-3 py-2 pr-9 text-left text-base font-normal leading-[1.4] text-[var(--color-text-heading)] transition-all duration-200 focus:border-[var(--color-primary-light)] focus:outline-none disabled:cursor-not-allowed disabled:bg-[var(--color-gray-50)] disabled:text-[var(--color-gray-400)] ${
          isOpen ? "border-[var(--color-primary-light)]" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[var(--color-gray-600)]" />
          <span className={value !== null ? "text-[var(--color-text-heading)]" : "text-[var(--color-gray-500)]"}>
            {value !== null ? value : placeholder}
          </span>
        </div>
        {value === null || disabled ? (
          <ChevronDown
            className={`h-4 w-4 text-[var(--color-gray-600)] transition-transform duration-200 ${
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
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-[var(--color-gray-500)] transition-colors hover:bg-[var(--color-gray-100)] hover:text-[var(--color-primary-light)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {isOpen && positioned && mounted && createPortal(dropdown, document.body)}
    </div>
  );
};

export default YearPicker;
