"use client";

import { useDispatch, useSelector } from "react-redux";
import { selectLocale, setLocale } from "@/store/i18n/i18nSlice";

const OPTIONS = [
    { code: "en", label: "EN" },
    { code: "bn", label: "বাংলা" },
];

const LocaleSwitcher = () => {
    const dispatch = useDispatch();
    const locale = useSelector(selectLocale);

    return (
        <div
            role="group"
            aria-label="Language switcher"
            className="flex items-center gap-1 rounded-full border border-[var(--color-gray-200)] bg-[var(--color-white)] p-1"
        >
            {OPTIONS.map((option) => {
                const isActive = option.code === locale;
                return (
                    <button
                        key={option.code}
                        type="button"
                        onClick={() => dispatch(setLocale(option.code))}
                        aria-pressed={isActive}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            isActive
                                ? "bg-[var(--color-primary)] text-[var(--color-white)]"
                                : "text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)]"
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

export default LocaleSwitcher;