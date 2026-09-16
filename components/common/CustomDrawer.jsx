"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const CustomDrawer = ({
  isOpen,
  onClose,
  title,
  children,
  width = "lg:w-2/3",
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
    } else {
      document.body.style.overflow = "";
      setVisible(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-[var(--color-overlay-black-40)] transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${width} bg-[var(--color-white)] shadow-2xl h-full flex flex-col transform transition-transform duration-300 ${visible ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-gray-100)] shrink-0">
          <h3 className="text-lg font-semibold text-[var(--color-primary)]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--color-gray-100)] transition-colors cursor-pointer"
          >
            <X size={20} className="text-[var(--color-gray-500)]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomDrawer;
