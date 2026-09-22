"use client";

import { NextIntlClientProvider } from "next-intl";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    RTL_LOCALES,
    hydrateLocale,
    selectLocale,
} from "@/store/i18n/i18nSlice";
import { messages } from "@/messages";

const FALLBACK_LOCALE = "en";

const LocalizationProvider = ({ children, initialLocale }) => {
    const dispatch = useDispatch();
    const locale = useSelector(selectLocale);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        dispatch(hydrateLocale());
        const timer = setTimeout(() => setHydrated(true), 0);
        return () => clearTimeout(timer);
    }, [dispatch]);

    const activeLocale = hydrated ? locale : initialLocale || FALLBACK_LOCALE;

    useEffect(() => {
        if (typeof document === "undefined") return;
        document.documentElement.dir = RTL_LOCALES.includes(activeLocale)
            ? "rtl"
            : "ltr";
        document.documentElement.lang = activeLocale || FALLBACK_LOCALE;
    }, [activeLocale]);

    return (
        <NextIntlClientProvider
            key={activeLocale}
            locale={activeLocale}
            messages={messages[activeLocale]}
            timeZone="Asia/Dhaka"
            onError={(error) => {
                if (error?.code !== "ENVIRONMENT_FALLBACK") {
                    console.error(error);
                }
            }}
        >
            {children}
        </NextIntlClientProvider>
    );
};

export default LocalizationProvider;