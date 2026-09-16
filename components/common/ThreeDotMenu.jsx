import React, { useState, useEffect, useRef } from "react";

const ThreeDotMenu = ({
  object,
  actions = [],
  isDisabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const handleMenuToggle = (e) => {
    e.stopPropagation();

    if (!isDisabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleActionClick = (action, e) => {
    e.stopPropagation();

    if (!action.isDisabled && action.onClick) {
      action.onClick(object);
      setIsOpen(false);
    }
  };

  // Close menu when clicking outside or scrolling
  useEffect(() => {
    const handleClose = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener("click", handleClose);
      window.addEventListener("scroll", handleClose, true);
    }

    return () => {
      document.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, [isOpen]);

  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Determine position for fixed dropdown
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedMenuHeight = Math.max(actions.length * 40, 120);
      const openUp = spaceBelow < estimatedMenuHeight;

      setMenuPos({
        top: openUp ? rect.top - estimatedMenuHeight - 4 : rect.bottom + 4,
        left: rect.right - 192,
      });
      setOpenAbove(openUp);
    }
  }, [isOpen, actions]);

  return (
    <div className="relative inline-block overflow-visible">
      {/* Three Dot Button */}
      <button
        ref={buttonRef}
        onClick={handleMenuToggle}
        disabled={isDisabled}
        title="More options"
        className={`p-2 rounded-md transition-colors ${
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-[var(--color-gray-100)] cursor-pointer"
        }`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-[var(--color-gray-600)]"
        >
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed w-48 bg-[var(--color-white)] border border-[var(--color-gray-200)] rounded-lg shadow-md z-[9999]"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <div className="py-1">
            {actions.length > 0 ? (
              actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => handleActionClick(action, e)}
                  disabled={action.isDisabled}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    action.isDisabled
                      ? "text-[var(--color-gray-400)] bg-[var(--color-gray-50)] cursor-not-allowed"
                      : "text-[var(--color-gray-700)] hover:bg-[var(--color-gray-100)] cursor-pointer"
                  }`}
                >
                  {action.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-[var(--color-gray-500)]">
                No actions available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDotMenu;