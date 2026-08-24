"use client";

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown } from "lucide-react";

const DateRangePicker = ({
  value = { startDate: null, endDate: null },
  onChange,
  placeholder = "Select date range",
  className = "",
  disabled = false,
  width = "w-[270px]",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positioned, setPositioned] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

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

  const formatDate = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  const getDisplayText = () => {
    const { startDate, endDate } = value;
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (startDate) {
      return `From ${formatDate(startDate)}`;
    } else if (endDate) {
      return `Until ${formatDate(endDate)}`;
    }
    return placeholder;
  };

  const handleApply = () => {
    const startDate = parseDate(tempStartDate);
    const endDate = parseDate(tempEndDate);

    if (onChange) {
      onChange({ startDate, endDate });
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStartDate("");
    setTempEndDate("");
    if (onChange) {
      onChange({ startDate: null, endDate: null });
    }
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setTempStartDate(formatDate(value.startDate));
      setTempEndDate(formatDate(value.endDate));
      setIsOpen(!isOpen);
    }
  };

  const dropdown = (
    <div
      ref={menuRef}
      className="fixed z-[9999] rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
      style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#043570]">
            Start Date
          </label>
          <input
            type="date"
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1f2937] focus:border-[#0A4D99] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#043570]">
            End Date
          </label>
          <input
            type="date"
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
            min={tempStartDate}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1f2937] focus:border-[#0A4D99] focus:outline-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleClear}
            type="button"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-[#595959] transition-colors hover:bg-gray-100"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            type="button"
            className="flex-1 rounded-md bg-[#0A4D99] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#063C76]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative ${width} ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`flex h-10 w-full items-center justify-between rounded-[10px] border border-slate-400 bg-white px-3 py-2 text-left text-base font-normal leading-[1.4] text-[#1f2937] transition-all duration-200 focus:border-[#0A4D99] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
          isOpen ? "border-[#0A4D99]" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <span
            className={
              value.startDate || value.endDate
                ? "text-[#1f2937]"
                : "text-gray-500"
            }
          >
            {getDisplayText()}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && positioned && mounted && createPortal(dropdown, document.body)}
    </div>
  );
};

export default DateRangePicker;
